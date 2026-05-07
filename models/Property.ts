import { query, queryOne } from '../lib/database-helpers';

interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  status: string;
  agentId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PropertyWithAgent extends Omit<Property, 'agentId'> {
  agentId: {
    _id: number;
    name: string;
    email: string;
  };
}

class Property {
  static async findById(id: string) {
    const sql = `
      SELECT p.*, u.id as agent_id, u.name as agent_name, u.email as agent_email
      FROM properties p
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE p.id = $1
    `;
    
    const result = await queryOne<any>(sql, [id]);
    if (!result) return null;
    
    // Format to match expected structure
    return {
      ...result,
      agentId: {
        _id: result.agent_id,
        name: result.agent_name,
        email: result.agent_email
      }
    };
  }

  static async find(query: any = {}) {
    let sql = `
      SELECT p.*, u.name as agent_name, u.email as agent_email
      FROM properties p
      LEFT JOIN users u ON p.agent_id = u.id
    `;
    const params: any[] = [];
    
    if (query.agentId) {
      sql += ' WHERE p.agent_id = $1';
      params.push(query.agentId);
    }
    
    if (query.status) {
      sql += params.length > 0 ? ' AND p.status = $' + (params.length + 1) : ' WHERE p.status = $1';
      params.push(query.status);
    }
    
    sql += ' ORDER BY p.created_at DESC';
    
    return await query(sql, params) as Property[];
  }

  static async create(data: Partial<Property>) {
    const sql = `
      INSERT INTO properties (title, description, address, price, currency, bedrooms, bathrooms, area, type, status, agent_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await query(sql, [
      data.title,
      data.description,
      data.address,
      data.price,
      data.currency || 'KES',
      data.bedrooms,
      data.bathrooms,
      data.area,
      data.type,
      data.status || 'available',
      data.agentId
    ]) as Property[];
    return result[0];
  }

  static async update(id: string, data: Partial<Property>) {
    const fields = Object.keys(data).filter(key => key !== 'id');
    const values = Object.values(data).filter((_, index) => fields[index] !== 'id');
    
    if (fields.length === 0) return null;
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const sql = `
      UPDATE properties 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [id, ...values]) as Property[];
    return result[0];
  }

  static async findSimilar(propertyId: string, property: any) {
    const minPrice = property.rent * 0.8; // 20% less
    const maxPrice = property.rent * 1.2; // 20% more
    const minBedrooms = property.bedrooms - 1;
    const maxBedrooms = property.bedrooms + 1;
    
    const sql = `
      SELECT p.*, u.name as agent_name, u.email as agent_email, u.phone as agent_phone
      FROM properties p
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE p.id != $1 
        AND p.status = 'available'
        AND p.is_approved = true
        AND p.city = $2
        AND p.rent BETWEEN $3 AND $4
        AND p.bedrooms BETWEEN $5 AND $6
      ORDER BY p.created_at DESC
      LIMIT 6
    `;
    
    const result = await query(sql, [
      propertyId,
      property.address.city,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms
    ]);
    
    return result as PropertyWithAgent[];
  }

  static async delete(id: string) {
    const sql = 'DELETE FROM properties WHERE id = $1';
    await query(sql, [id]);
    return true;
  }
}

export default Property;
