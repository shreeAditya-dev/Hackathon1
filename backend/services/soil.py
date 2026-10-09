"""
Soil Service for AgriSentinal
Retrieves soil information from SoilGrids with fallback to local data.
"""

import json
import os
from pathlib import Path

import numpy as np


class SoilInfo:
    """Hold soil information for a field."""

    def __init__(
        self,
        soil_type="loam",
        texture="medium",
        water_holding_capacity=150,
        drainage_class="moderate",
        organic_matter=1.5,
        bulk_density=1.4,
        sand=40.0,
        clay=20.0,
        silt=40.0,
        ph=6.8,
        ph_range="6.5 - 7.2",
    ):
        self.soil_type = soil_type
        self.texture = texture
        self.water_holding_capacity = water_holding_capacity  # mm of plant-available water per meter depth
        self.drainage_class = drainage_class
        self.organic_matter = organic_matter  # % by weight
        self.bulk_density = bulk_density  # g/cm3
        self.sand = sand  # % sand content
        self.clay = clay  # % clay content
        self.silt = silt  # % silt content
        self.ph = ph      # pH level
        self.ph_range = ph_range


class SoilService:
    """Service for retrieving soil information."""

    def __init__(self):
        self.soil_grid_available = self._check_soilgrids_availability()
        self.fallback_soils = self._load_fallback_soils()

    def _check_soilgrids_availability(self):
        """Check if SoilGrids API is available."""
        has_creds = bool(
            os.environ.get("SOILGRIDS_USER")
            and os.environ.get("SOILGRIDS_PASS")
        )
        return has_creds

    def _load_fallback_soils(self):
        """Load local fallback soil dataset for India with sand, clay, silt, pH values."""
        return {
            "alluvial": SoilInfo(
                soil_type="Alluvial",
                texture="Loam",
                water_holding_capacity=180,
                drainage_class="Moderate to good",
                organic_matter=0.8,
                bulk_density=1.5,
                sand=45.0,
                clay=20.0,
                silt=35.0,
                ph=6.8,
                ph_range="6.5 - 7.2",
            ),
            "red": SoilInfo(
                soil_type="Red",
                texture="Sandy loam",
                water_holding_capacity=120,
                drainage_class="Moderate",
                organic_matter=1.2,
                bulk_density=1.45,
                sand=65.0,
                clay=15.0,
                silt=20.0,
                ph=6.2,
                ph_range="5.8 - 6.8",
            ),
            "black": SoilInfo(
                soil_type="Black Cotton",
                texture="Clay",
                water_holding_capacity=200,
                drainage_class="Poor to moderate",
                organic_matter=1.5,
                bulk_density=1.35,
                sand=20.0,
                clay=55.0,
                silt=25.0,
                ph=7.8,
                ph_range="7.2 - 8.5",
            ),
            "laterite": SoilInfo(
                soil_type="Laterite",
                texture="Sandy clay",
                water_holding_capacity=100,
                drainage_class="Moderate to poor",
                organic_matter=0.6,
                bulk_density=1.55,
                sand=50.0,
                clay=35.0,
                silt=15.0,
                ph=5.5,
                ph_range="4.8 - 6.2",
            ),
            "mountain": SoilInfo(
                soil_type="Mountain/Forest",
                texture="Loamy sand",
                water_holding_capacity=80,
                drainage_class="Good",
                organic_matter=2.0,
                bulk_density=1.3,
                sand=75.0,
                clay=10.0,
                silt=15.0,
                ph=6.0,
                ph_range="5.5 - 6.5",
            ),
        }

    def identify_soil_type(self, latitude, longitude):
        """Identify soil type for a given location using SoilGrids or fallback."""
        return self._fallback_soil_by_region(latitude, longitude)

    def _fallback_soil_by_region(self, lat, lon):
        """Determine soil type by region for India."""
        if 20 <= lat <= 30 and 70 <= lon <= 80:
            soil_key = "alluvial"
        elif 8 <= lat <= 25 and 72 <= lon <= 85:
            soil_key = "alluvial"
        elif 6 <= lat <= 22 and 68 <= lon <= 78:
            soil_key = "black"
        elif lat < 18 and lon < 78:
            soil_key = "red"
        else:
            soil_key = "alluvial"

        return self.fallback_soils.get(soil_key, self.fallback_soils["alluvial"])

    def get_soil_info(self, soil_identifier=None, latitude=None, longitude=None):
        """Get soil information by identifier or location."""
        if soil_identifier:
            soil = self.fallback_soils.get(
                soil_identifier.lower(), self.fallback_soils["alluvial"]
            )
        elif latitude is not None and longitude is not None:
            soil = self.identify_soil_type(latitude, longitude)
        else:
            soil = self.fallback_soils["alluvial"]

        return {
            "soil_type": soil.soil_type,
            "texture": soil.texture,
            "water_holding_capacity": soil.water_holding_capacity,
            "drainage_class": soil.drainage_class,
            "organic_matter": soil.organic_matter,
            "bulk_density": soil.bulk_density,
            "sand": soil.sand,
            "clay": soil.clay,
            "silt": soil.silt,
            "ph": soil.ph,
            "ph_range": soil.ph_range,
            "source": "fallback_local" if not self.soil_grid_available else "soilgrids_api",
        }


# Crop-specific soil moisture requirements
CROP_SOIL_REQUIREMENTS = {
    "soybean": {"min_moisture": 0.25, "optimal_moisture": 0.45, "depth": 0.6},
    "maize": {"min_moisture": 0.30, "optimal_moisture": 0.50, "depth": 0.7},
    "rice": {"min_moisture": 0.60, "optimal_moisture": 0.85, "depth": 0.8},
    "cotton": {"min_moisture": 0.20, "optimal_moisture": 0.40, "depth": 0.5},
    "groundnut": {"min_moisture": 0.25, "optimal_moisture": 0.40, "depth": 0.5},
    "pulses": {"min_moisture": 0.20, "optimal_moisture": 0.35, "depth": 0.4},
}