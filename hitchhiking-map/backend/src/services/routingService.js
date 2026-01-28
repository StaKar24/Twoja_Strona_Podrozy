const fetch = require('node-fetch');

class RoutingService {
  constructor() {
    this.apiKey = process.env.ORS_API_KEY;
    this.baseUrl = 'https://api.openrouteservice.org/v2/directions';
  }

  // Mapowanie transport_type na profile ORS
  getProfile(transportType) {
    const profiles = {
      'hitchhiking': 'driving-car',
      'car': 'driving-car',
      'bus': 'driving-car',
      'walk': 'foot-walking',
      'bike': 'cycling-regular',
      'ferry': 'driving-car' //prom dobrze się routej w trybie samochodowym
      // train, other - używają prostej linii
    };
    return profiles[transportType] || 'driving-car';
  }

  // Wygeneruj trasę między dwoma punktami
  async getRoute(startLng, startLat, endLng, endLat, transportType = 'hitchhiking') {
    // Dla pociągów i "other" używaj prostej linii 
    const straightLineTypes = ['train', 'other'];
    
    if (straightLineTypes.includes(transportType)) {
      console.log(`ℹ️  Transport type "${transportType}" - używam prostej linii`);
      return this.createStraightLine(startLng, startLat, endLng, endLat);
    }

    try {
      const profile = this.getProfile(transportType);
      const url = `${this.baseUrl}/${profile}/geojson`;
      
      //debug
      console.log('  DEBUG - Request do ORS:');
      console.log('  URL:', url);
      console.log('  Coordinates:', [[startLng, startLat], [endLng, endLat]]);
      console.log('  API Key:', this.apiKey ? 'Jest OK' : 'BRAK');

      //fetch routing trasy
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: [[startLng, startLat], [endLng, endLat]],
        })
      });
      console.log('Response status:', response.status);


      if (!response.ok) {
        const errorText = await response.text();
        console.error('ORS Error Response:', errorText);
        throw new Error(`ORS API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json(); 
      //console.log('Full ORS response:', JSON.stringify(data, null, 2)); //do testowania przy błędach routingowania
      console.log('Data received:', data.features ? `${data.features.length} features` : 'No features');


      if (!data.features || data.features.length === 0) {
        console.error('ORS zwrócił pustą odpowiedź - używam prostej linii jako fallback');
        throw new Error('No route found');
      }

      const route = data.features[0]; //zwracanie trasy
      
      return {
        geometry: route.geometry, // GeoJSON geometry
        distance: route.properties.summary.distance, 
        duration: route.properties.summary.duration  
      };

    } catch (error) {
      console.error('Błąd generowania trasy:', error);
      throw error;
    }
  }

  // prosta linia 
  createStraightLine(startLng, startLat, endLng, endLat) {
    return {
      geometry: {
        type: 'LineString',
        coordinates: [
          [startLng, startLat],
          [endLng, endLat]
        ]
      },
      distance: this.calculateDistance(startLat, startLng, endLat, endLng),
      duration: null
    };
  }

  // Oblicz odległość w linii prostej
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Promień Ziemi w metrach
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  toRad(degrees) {
    return degrees * Math.PI / 180;
  }
}

module.exports = new RoutingService();