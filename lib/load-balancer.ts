// Load balancer and scaling configuration for high traffic

export interface ServerConfig {
  id: string;
  host: string;
  port: number;
  weight: number;
  currentConnections: number;
  maxConnections: number;
}

export interface ServerInstance extends ServerConfig {
  healthy: boolean;
  responseTime: number;
  lastHealthCheck: Date;
}

export interface LoadBalancerConfig {
  algorithm: 'round-robin' | 'weighted-round-robin' | 'least-connections' | 'response-time';
  healthCheckInterval: number; // milliseconds
  healthCheckTimeout: number; // milliseconds
  maxRetries: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number; // milliseconds
}

export class LoadBalancer {
  private static instance: LoadBalancer;
  private servers: ServerInstance[] = [];
  private config: LoadBalancerConfig;
  private currentIndex = 0;
  private circuitBreakers: Map<string, { isOpen: boolean; openedAt: number }> = new Map();

  constructor(config: LoadBalancerConfig) {
    this.config = config;
    this.initializeServers();
    this.startHealthChecks();
  }

  static getInstance(config?: LoadBalancerConfig): LoadBalancer {
    if (!LoadBalancer.instance) {
      if (!config) {
        throw new Error('LoadBalancer config required for first initialization');
      }
      LoadBalancer.instance = new LoadBalancer(config);
    }
    return LoadBalancer.instance;
  }

  private initializeServers(): void {
    // In production, this would load from configuration or service discovery
    const serverConfigs = [
      { id: 'server-1', host: process.env.SERVER_1_HOST || 'localhost', port: 3001, weight: 1 },
      { id: 'server-2', host: process.env.SERVER_2_HOST || 'localhost', port: 3002, weight: 1 },
      { id: 'server-3', host: process.env.SERVER_3_HOST || 'localhost', port: 3003, weight: 1 },
    ];

    this.servers = serverConfigs.map(config => ({
      ...config,
      healthy: true,
      currentConnections: 0,
      maxConnections: 1000,
      responseTime: 0,
      lastHealthCheck: new Date(),
    }));
  }

  // Get next server based on load balancing algorithm
  getNextServer(): ServerInstance | null {
    const healthyServers = this.servers.filter(server => 
      server.healthy && !this.isCircuitBreakerOpen(server.id)
    );

    if (healthyServers.length === 0) {
      return null;
    }

    switch (this.config.algorithm) {
      case 'round-robin':
        return this.roundRobin(healthyServers);
      case 'weighted-round-robin':
        return this.weightedRoundRobin(healthyServers);
      case 'least-connections':
        return this.leastConnections(healthyServers);
      case 'response-time':
        return this.bestResponseTime(healthyServers);
      default:
        return this.roundRobin(healthyServers);
    }
  }

  private roundRobin(servers: ServerInstance[]): ServerInstance {
    const server = servers[this.currentIndex % servers.length];
    this.currentIndex++;
    return server;
  }

  private weightedRoundRobin(servers: ServerInstance[]): ServerInstance {
    const totalWeight = servers.reduce((sum, server) => sum + server.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const server of servers) {
      random -= server.weight;
      if (random <= 0) {
        return server;
      }
    }
    
    return servers[0];
  }

  private leastConnections(servers: ServerInstance[]): ServerInstance {
    return servers.reduce((min, server) => 
      server.currentConnections < min.currentConnections ? server : min
    );
  }

  private bestResponseTime(servers: ServerInstance[]): ServerInstance {
    return servers.reduce((best, server) => 
      server.responseTime < best.responseTime ? server : best
    );
  }

  // Circuit breaker logic
  private isCircuitBreakerOpen(serverId: string): boolean {
    const breaker = this.circuitBreakers.get(serverId);
    if (!breaker) return false;

    if (breaker.isOpen) {
      const timeSinceOpen = Date.now() - breaker.openedAt;
      if (timeSinceOpen > this.config.circuitBreakerTimeout) {
        // Try to close the circuit breaker
        this.circuitBreakers.delete(serverId);
        return false;
      }
      return true;
    }

    return false;
  }

  openCircuitBreaker(serverId: string): void {
    this.circuitBreakers.set(serverId, {
      isOpen: true,
      openedAt: Date.now(),
    });
  }

  // Health checks
  private startHealthChecks(): void {
    setInterval(() => {
      this.checkAllServers();
    }, this.config.healthCheckInterval);
  }

  private async checkAllServers(): Promise<void> {
    const healthCheckPromises = this.servers.map(server => this.checkServerHealth(server));
    await Promise.allSettled(healthCheckPromises);
  }

  private async checkServerHealth(server: ServerInstance): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Simple health check - in production, this would be a real HTTP request
      const response = await this.healthCheckRequest(server);
      const responseTime = Date.now() - startTime;

      server.healthy = response.healthy;
      server.responseTime = responseTime;
      server.lastHealthCheck = new Date();

      if (!response.healthy) {
        this.openCircuitBreaker(server.id);
      }

    } catch (error) {
      console.error(`Health check failed for server ${server.id}:`, error);
      server.healthy = false;
      this.openCircuitBreaker(server.id);
    }
  }

  private async healthCheckRequest(server: ServerInstance): Promise<{ healthy: boolean }> {
    // Mock health check - in production, make real HTTP request
    return { healthy: Math.random() > 0.1 }; // 90% success rate
  }

  // Get load balancer statistics
  getStats(): {
    totalServers: number;
    healthyServers: number;
    totalConnections: number;
    averageResponseTime: number;
    circuitBreakersOpen: number;
  } {
    const healthyServers = this.servers.filter(s => s.healthy).length;
    const totalConnections = this.servers.reduce((sum, s) => sum + s.currentConnections, 0);
    const averageResponseTime = this.servers.reduce((sum, s) => sum + s.responseTime, 0) / this.servers.length;
    const circuitBreakersOpen = Array.from(this.circuitBreakers.values()).filter(b => b.isOpen).length;

    return {
      totalServers: this.servers.length,
      healthyServers,
      totalConnections,
      averageResponseTime,
      circuitBreakersOpen,
    };
  }

  // Add or remove servers dynamically
  addServer(serverConfig: ServerConfig): void {
    const server: ServerInstance = {
      ...serverConfig,
      healthy: true,
      responseTime: 0,
      lastHealthCheck: new Date(),
    };
    this.servers.push(server);
  }

  removeServer(serverId: string): void {
    this.servers = this.servers.filter(s => s.id !== serverId);
    this.circuitBreakers.delete(serverId);
  }

  // Update server weight
  updateServerWeight(serverId: string, weight: number): void {
    const server = this.servers.find(s => s.id === serverId);
    if (server) {
      server.weight = weight;
    }
  }
}

// Auto-scaling configuration
export interface AutoScalingConfig {
  minInstances: number;
  maxInstances: number;
  scaleUpThreshold: number; // CPU/memory percentage
  scaleDownThreshold: number; // CPU/memory percentage
  scaleUpCooldown: number; // milliseconds
  scaleDownCooldown: number; // milliseconds
  targetResponseTime: number; // milliseconds
}

export class AutoScaler {
  private static instance: AutoScaler;
  private config: AutoScalingConfig;
  private lastScaleAction = 0;
  private loadBalancer: LoadBalancer;

  constructor(config: AutoScalingConfig, loadBalancer: LoadBalancer) {
    this.config = config;
    this.loadBalancer = loadBalancer;
    this.startMonitoring();
  }

  static getInstance(config?: AutoScalingConfig, loadBalancer?: LoadBalancer): AutoScaler {
    if (!AutoScaler.instance) {
      if (!config || !loadBalancer) {
        throw new Error('AutoScaler config and loadBalancer required for first initialization');
      }
      AutoScaler.instance = new AutoScaler(config, loadBalancer);
    }
    return AutoScaler.instance;
  }

  private startMonitoring(): void {
    setInterval(() => {
      this.checkScalingConditions();
    }, 30000); // Check every 30 seconds
  }

  private async checkScalingConditions(): Promise<void> {
    const now = Date.now();
    const cooldownPeriod = now - this.lastScaleAction;

    // Get current metrics
    const stats = this.loadBalancer.getStats();
    const metrics = await this.getSystemMetrics();

    // Check if we should scale up
    if (cooldownPeriod > this.config.scaleUpCooldown) {
      if (this.shouldScaleUp(stats, metrics)) {
        await this.scaleUp();
        this.lastScaleAction = now;
        return;
      }
    }

    // Check if we should scale down
    if (cooldownPeriod > this.config.scaleDownCooldown) {
      if (this.shouldScaleDown(stats, metrics)) {
        await this.scaleDown();
        this.lastScaleAction = now;
      }
    }
  }

  private shouldScaleUp(stats: any, metrics: any): boolean {
    const currentInstances = stats.totalServers;
    
    // Don't scale up if we're at max capacity
    if (currentInstances >= this.config.maxInstances) {
      return false;
    }

    // Scale up if CPU usage is high
    if (metrics.cpuUsage > this.config.scaleUpThreshold) {
      return true;
    }

    // Scale up if memory usage is high
    if (metrics.memoryUsage > this.config.scaleUpThreshold) {
      return true;
    }

    // Scale up if response time is high
    if (stats.averageResponseTime > this.config.targetResponseTime) {
      return true;
    }

    // Scale up if servers are at capacity
    const avgConnectionsPerServer = stats.totalConnections / currentInstances;
    if (avgConnectionsPerServer > 800) { // 80% of max connections
      return true;
    }

    return false;
  }

  private shouldScaleDown(stats: any, metrics: any): boolean {
    const currentInstances = stats.totalServers;
    
    // Don't scale down if we're at min capacity
    if (currentInstances <= this.config.minInstances) {
      return false;
    }

    // Scale down if CPU usage is low
    if (metrics.cpuUsage < this.config.scaleDownThreshold) {
      return true;
    }

    // Scale down if memory usage is low
    if (metrics.memoryUsage < this.config.scaleDownThreshold) {
      return true;
    }

    // Scale down if response time is good and we have excess capacity
    if (stats.averageResponseTime < this.config.targetResponseTime / 2) {
      const avgConnectionsPerServer = stats.totalConnections / currentInstances;
      if (avgConnectionsPerServer < 200) { // 20% of max connections
        return true;
      }
    }

    return false;
  }

  private async scaleUp(): Promise<void> {
    console.log('Scaling up - adding new server instance');
    
    // In production, this would:
    // 1. Provision new server/container
    // 2. Deploy application
    // 3. Add to load balancer
    
    const newServerId = `server-${Date.now()}`;
    const newPort = 3000 + this.loadBalancer.getStats().totalServers + 1;
    
    this.loadBalancer.addServer({
      id: newServerId,
      host: 'localhost', // In production, this would be the new server's IP
      port: newPort,
      weight: 1,
      currentConnections: 0,
      maxConnections: 1000,
      responseTime: 0,
      lastHealthCheck: new Date(),
    });
  }

  private async scaleDown(): Promise<void> {
    console.log('Scaling down - removing server instance');
    
    // In production, this would:
    // 1. Remove server from load balancer
    // 2. Wait for connections to drain
    // 3. Decommission server
    
    const servers = this.loadBalancer.getStats();
    if (servers.totalServers > this.config.minInstances) {
      // Remove the server with the least connections
      // This is a simplified implementation
      const serverId = `server-${servers.totalServers}`;
      this.loadBalancer.removeServer(serverId);
    }
  }

  private async getSystemMetrics(): Promise<{ cpuUsage: number; memoryUsage: number }> {
    // In production, this would get real system metrics
    // For now, return mock data
    return {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
    };
  }

  getScalingStatus(): {
    currentInstances: number;
    minInstances: number;
    maxInstances: number;
    lastScaleAction: Date;
  } {
    return {
      currentInstances: this.loadBalancer.getStats().totalServers,
      minInstances: this.config.minInstances,
      maxInstances: this.config.maxInstances,
      lastScaleAction: new Date(this.lastScaleAction),
    };
  }
}

// Default configurations
export const defaultLoadBalancerConfig: LoadBalancerConfig = {
  algorithm: 'least-connections',
  healthCheckInterval: 30000, // 30 seconds
  healthCheckTimeout: 5000, // 5 seconds
  maxRetries: 3,
  circuitBreakerThreshold: 5,
  circuitBreakerTimeout: 60000, // 1 minute
};

export const defaultAutoScalingConfig: AutoScalingConfig = {
  minInstances: 2,
  maxInstances: 10,
  scaleUpThreshold: 70, // 70%
  scaleDownThreshold: 30, // 30%
  scaleUpCooldown: 300000, // 5 minutes
  scaleDownCooldown: 600000, // 10 minutes
  targetResponseTime: 500, // 500ms
};
