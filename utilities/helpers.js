module.exports.geocodeWithFallback = async (locationInput, countryInput) => {
    let addressParts = locationInput.split(",").map(part => part.trim());
    let partsCount = addressParts.length;

    while (addressParts.length > 0) {
        const query = `${addressParts.join(', ')}, ${countryInput}`;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, {
                headers: { 'User-Agent': 'WanderlustApp/1.0 (Educational Project)' }
            });
            const data = await response.json();

            // If success then immediately send forth the best matched (i.e. data[0]) coords.
            if (data && data.length > 0) {
                // We determine the resolution of the geocoded based on how many parts were deleted to match it.
                let resolution = "exact";
                let partsDeleted = partsCount - addressParts.length;

                if (partsDeleted === 1) {
                    resolution = "area";
                }
                else if (partsDeleted >= 2) {
                    resolution = "district"
                }

                return {
                    coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
                    resolution: resolution,
                };
            }
        } catch (error) {
            console.error("Fetch error during geocoding:", error);
        }

        // If loop fails then move to next portion and redo a check.
        partsCount--;
        addressParts.shift(); 
    }

    // If the user typed total gibberish and nothing matched
    console.log("All location matches failed. Using default fallback.");
    return {
        coordinates: [73.7898, 18.5204], // Default coordinates: Pune, Maharashtra
        resolution: resolution,
    };
}