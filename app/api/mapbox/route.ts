import { NextRequest, NextResponse } from 'next/server';

// Mapbox API configuration
const MAPBOX_API_BASE = 'https://api.mapbox.com';
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_TOKEN) {
  console.warn('Mapbox access token not configured');
}

// GET - Geocoding and Mapbox services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    const query = searchParams.get('query');
    const proximity = searchParams.get('proximity');
    const types = searchParams.get('types');
    const limit = searchParams.get('limit') || '5';
    const country = searchParams.get('country') || 'KE';

    if (!service || !query) {
      return NextResponse.json(
        { error: 'Service and query parameters are required' },
        { status: 400 }
      );
    }

    if (!MAPBOX_TOKEN) {
      return NextResponse.json(
        { error: 'Mapbox service not configured' },
        { status: 503 }
      );
    }

    let url = '';
    let response;

    switch (service) {
      case 'geocoding':
        // Forward geocoding - convert address to coordinates
        url = `${MAPBOX_API_BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
        break;

      case 'reverse':
        // Reverse geocoding - convert coordinates to address
        url = `${MAPBOX_API_BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
        break;

      case 'autocomplete':
        // Autocomplete suggestions
        url = `${MAPBOX_API_BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid service. Use geocoding, reverse, or autocomplete' },
          { status: 400 }
        );
    }

    // Build query parameters
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      limit: limit,
      country: country,
    });

    // Add optional parameters
    if (proximity) {
      params.append('proximity', proximity);
    }

    if (types) {
      params.append('types', types);
    }

    if (service === 'autocomplete') {
      params.append('autocomplete', 'true');
    }

    const fullUrl = `${url}?${params.toString()}`;

    // Make request to Mapbox API
    const mapboxResponse = await fetch(fullUrl);
    
    if (!mapboxResponse.ok) {
      const errorData = await mapboxResponse.text();
      console.error('Mapbox API error:', errorData);
      return NextResponse.json(
        { error: 'Mapbox API request failed', details: errorData },
        { status: mapboxResponse.status }
      );
    }

    const data = await mapboxResponse.json();

    // Transform Mapbox response to our format
    const transformedData = {
      type: data.type,
      query: data.query,
      features: data.features?.map((feature: any) => ({
        id: feature.id,
        type: feature.type,
        place_name: feature.place_name,
        text: feature.text,
        place_type: feature.place_type[0],
        center: feature.center,
        bbox: feature.bbox,
        properties: feature.properties,
        context: feature.context?.map((ctx: any) => ({
          id: ctx.id,
          text: ctx.text
        })) || [],
        relevance: feature.relevance,
        // Additional fields for our use
        address: {
          full: feature.place_name,
          components: {
            street: feature.text,
            city: feature.context?.find((ctx: any) => ctx.id?.includes('place'))?.text,
            state: feature.context?.find((ctx: any) => ctx.id?.includes('region'))?.text,
            country: feature.context?.find((ctx: any) => ctx.id?.includes('country'))?.text,
            postcode: feature.context?.find((ctx: any) => ctx.id?.includes('postcode'))?.text
          }
        },
        coordinates: {
          lng: feature.center[0],
          lat: feature.center[1]
        }
      })) || [],
      attribution: data.attribution
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Mapbox service error:', error);
    return NextResponse.json(
      { error: 'Mapbox service failed' },
      { status: 500 }
    );
  }
}

// POST - Advanced Mapbox services (isochrones, directions, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service } = body;

    if (!MAPBOX_TOKEN) {
      return NextResponse.json(
        { error: 'Mapbox service not configured' },
        { status: 503 }
      );
    }

    let url = '';
    let response;

    switch (service) {
      case 'isochrone':
        // Travel time isochrones
        const { coordinates, profile: isochroneProfile = 'driving', contours = [{ minutes: 15 }] } = body;
        
        if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
          return NextResponse.json(
            { error: 'Valid coordinates [lng, lat] are required' },
            { status: 400 }
          );
        }

        url = `${MAPBOX_API_BASE}/isochrone/v1/mapbox/${isochroneProfile}/${coordinates[0]},${coordinates[1]}`;
        const contours_minutes = contours.map((c: { minutes: number }) => c.minutes).join(',');
        response = await fetch(`${url}?contours_minutes=${contours_minutes}&access_token=${MAPBOX_TOKEN}`);
        break;

      case 'directions':
        // Turn-by-turn directions
        const { waypoints, profile: directionsProfile = 'driving' } = body;
        
        if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
          return NextResponse.json(
            { error: 'At least 2 waypoints are required' },
            { status: 400 }
          );
        }

        const coordinatesStr = waypoints.map((wp: [number, number]) => `${wp[0]},${wp[1]}`).join(';');
        url = `${MAPBOX_API_BASE}/directions/v5/mapbox/${directionsProfile}/${coordinatesStr}`;
        response = await fetch(`${url}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full`);
        break;

      case 'matrix':
        // Distance matrix for multiple origins/destinations
        const { origins, destinations, profile: matrixProfile = 'driving' } = body;
        
        if (!origins || !destinations) {
          return NextResponse.json(
            { error: 'Both origins and destinations are required' },
            { status: 400 }
          );
        }

        const originsStr = origins.map((o: [number, number]) => `${o[0]},${o[1]}`).join(';');
        const destinationsStr = destinations.map((d: [number, number]) => `${d[0]},${d[1]}`).join(';');
        url = `${MAPBOX_API_BASE}/directions-matrix/v1/mapbox/${matrixProfile}/${originsStr};${destinationsStr}`;
        response = await fetch(`${url}?access_token=${MAPBOX_TOKEN}`);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid service. Use isochrone, directions, or matrix' },
          { status: 400 }
        );
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mapbox API error:', errorData);
      return NextResponse.json(
        { error: 'Mapbox API request failed', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Mapbox POST service error:', error);
    return NextResponse.json(
      { error: 'Mapbox service failed' },
      { status: 500 }
    );
  }
}
