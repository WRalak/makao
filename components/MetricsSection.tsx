'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Users, Home, MapPin } from 'lucide-react';

interface Metric {
  value: string;
  label: string;
  icon: React.ElementType;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

interface MetricsData {
  totalProperties: number;
  totalTenants: number;
  totalAgents: number;
  totalCities: number;
  satisfactionRate: number;
  supportAvailable: boolean;
  monthlyGrowth?: {
    properties: number;
    tenants: number;
    agents: number;
  };
}

const MetricsSection: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real metrics from your API
      const response = await fetch('/api/public-stats');
      let data: MetricsData;

      if (response.ok) {
        data = await response.json();
      } else {
        // Fallback data if API fails
        data = {
          totalProperties: 10487,
          totalTenants: 5234,
          totalAgents: 2156,
          totalCities: 28,
          satisfactionRate: 98,
          supportAvailable: true,
          monthlyGrowth: {
            properties: 12.5,
            tenants: 8.3,
            agents: 15.2
          }
        };
      }

      const formattedMetrics: Metric[] = [
        {
          value: data.totalProperties.toLocaleString(),
          label: "Properties",
          icon: Home,
          change: data.monthlyGrowth ? `+${data.monthlyGrowth.properties}%` : undefined,
          changeType: 'increase'
        },
        {
          value: data.totalTenants.toLocaleString(),
          label: "Happy Tenants",
          icon: Users,
          change: data.monthlyGrowth ? `+${data.monthlyGrowth.tenants}%` : undefined,
          changeType: 'increase'
        },
        {
          value: data.totalAgents.toLocaleString(),
          label: "Expert Agents",
          icon: TrendingUp,
          change: data.monthlyGrowth ? `+${data.monthlyGrowth.agents}%` : undefined,
          changeType: 'increase'
        },
        {
          value: `${data.totalCities}+`,
          label: "Cities",
          icon: MapPin,
          change: 'Active',
          changeType: 'increase'
        }
      ];

      setMetrics(formattedMetrics);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      // Set fallback metrics on error
      setMetrics([
        {
          value: "10k+",
          label: "Properties",
          icon: Home,
          change: '+12.5%',
          changeType: 'increase'
        },
        {
          value: "5k+",
          label: "Happy Tenants",
          icon: Users,
          change: '+8.3%',
          changeType: 'increase'
        },
        {
          value: "2k+",
          label: "Expert Agents",
          icon: TrendingUp,
          change: '+15.2%',
          changeType: 'increase'
        },
        {
          value: "25+",
          label: "Cities",
          icon: MapPin,
          change: 'Active',
          changeType: 'increase'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[...Array(4)].map((_, index) => (
              <div 
                key={index} 
                className="text-center p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="w-8 h-8 bg-slate-200 rounded-full mx-auto mb-3 animate-pulse"></div>
                <div className="h-8 bg-slate-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-headline-lg text-headline-lg text-slate-800 mb-4">
            Trusted Across East Africa
          </h2>
          <p className="text-slate-500 font-body-md max-w-2xl mx-auto">
            Join thousands of satisfied tenants and agents who trust Makao for their rental needs across Nairobi, Kigali, Dar es Salaam, and beyond.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className="text-center p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all group"
            >
              <div className="relative inline-block mb-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-900 group-hover:bg-blue-100 transition-colors">
                  <metric.icon className="w-8 h-8" />
                </div>
                {metric.change && metric.changeType && (
                  <div className={`absolute -top-1 -right-1 px-2 py-1 rounded-full text-xs font-medium ${
                    metric.changeType === 'increase' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {metric.change}
                  </div>
                )}
              </div>
              
              <p className="font-display-xl text-blue-900 text-3xl sm:text-4xl mb-2 font-bold">
                {metric.value}
              </p>
              
              <p className="font-label-bold text-slate-500 uppercase tracking-wider text-xs mb-2">
                {metric.label}
              </p>

              {/* Additional context */}
              {metric.label === 'Properties' && (
                <p className="text-xs text-slate-400">
                  Across all regions
                </p>
              )}
              {metric.label === 'Happy Tenants' && (
                <p className="text-xs text-slate-400">
                  4.8★ average rating
                </p>
              )}
              {metric.label === 'Expert Agents' && (
                <p className="text-xs text-slate-400">
                  Verified professionals
                </p>
              )}
              {metric.label === 'Cities' && (
                <p className="text-xs text-slate-400">
                  4 countries covered
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-8 border-t border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-slate-800 mb-2">
                Why Choose Makao?
              </h3>
              <p className="text-sm text-slate-500">
                Verified listings • Secure payments • 24/7 support
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Verified Properties</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;
