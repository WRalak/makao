import { db } from '@/lib/neon';
import { favorites, type Favorite, type NewFavorite } from '@/lib/schema';
import { eq, and, desc, count } from 'drizzle-orm';

export class FavoriteModel {
  // Create a new favorite
  static async create(data: NewFavorite): Promise<Favorite> {
    const [favorite] = await db.insert(favorites)
      .values(data)
      .returning();
    return favorite;
  }

  // Find favorite by user and property
  static async findByUserAndProperty(userId: number, propertyId: number): Promise<Favorite | null> {
    const [favorite] = await db.select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.propertyId, propertyId)
        )
      )
      .limit(1);
    return favorite || null;
  }

  // Get all favorites for a user
  static async findByUserId(userId: number): Promise<Favorite[]> {
    return await db.select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  // Get all favorites for a property
  static async findByPropertyId(propertyId: number): Promise<Favorite[]> {
    return await db.select()
      .from(favorites)
      .where(eq(favorites.propertyId, propertyId))
      .orderBy(desc(favorites.createdAt));
  }

  // Remove a favorite
  static async remove(userId: number, propertyId: number): Promise<boolean> {
    const result = await db.delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.propertyId, propertyId)
        )
      );
    return (result.rowCount ?? 0) > 0;
  }

  // Check if property is favorited by user
  static async isFavorited(userId: number, propertyId: number): Promise<boolean> {
    const favorite = await this.findByUserAndProperty(userId, propertyId);
    return !!favorite;
  }

  // Get favorite count for a property
  static async getPropertyFavoriteCount(propertyId: number): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(favorites)
      .where(eq(favorites.propertyId, propertyId));
    return result?.count || 0;
  }
}
