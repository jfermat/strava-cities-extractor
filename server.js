const express = require('express');
const yaml = require('js-yaml');
const fs = require('fs');
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// Function to remove accents from text
const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// Load and process excluded cities from YAML
const excludedCities = yaml.load(fs.readFileSync('./excluded-cities.yaml', 'utf8'))
    .excluded_cities
    .map(city => removeAccents(city.toLowerCase()));

app.post('/', (req, res) => {
    try {
        const data = req.body;
        
        const cities = data.segment_efforts
            .filter(effort => {
                if (!effort.segment?.city || effort.segment.city.includes(',')) return false;
                const normalizedCity = removeAccents(effort.segment.city.toLowerCase());
                return !excludedCities.includes(normalizedCity);
            })
            .map(effort => {
                let city = effort.segment.city.trim();
                return {
                    original: city.charAt(0).toUpperCase() + city.slice(1),
                    normalized: removeAccents(city.toLowerCase())
                };
            })
            .filter((city, index, self) => 
                self.findIndex(t => t.normalized === city.normalized) === index && city.original
            )
            .map(city => city.original)
            .join(', ');

        res.status(200).json({
            cities: cities
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: 'Invalid data received'
        });
    }
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  const addr = server.address();
  if (typeof addr === 'string') {
    console.log(`Server is running on ${addr}`);
  } else {
    console.log(`Server is running on http://${addr.address}:${addr.port}`);
  }
});

server.on('error', (err) => {
  console.error(err);
  process.exit(1);
});