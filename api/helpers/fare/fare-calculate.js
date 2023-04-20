const { VehicleType, weightType, DriveMode, VehicleBasePrice, Axios, Fetch } =
  sails.config.constants;
module.exports = {
  friendlyName: "Fare calculate",

  description: "Calculate the Fare with distance",

  inputs: {
    myself: {
      type: "boolean",
    },
    item: {
      type: "string",
    },
    bookingWeight: {
      type: "number",
    },
    bookingWeightType: {
      type: "string",
    },
    vehicleType: {
      type: "string",
      required: true,
    },
    startingPoint: {
      type: "string",
      required: true,
    },
    endingPoint: {
      type: "string",
      required: true,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    // TODO
    try {
      let {
        myself,
        item,
        bookingWeight,
        bookingWeightType,
        vehicleType,
        startingPoint,
        endingPoint,
      } = inputs;
      // declare fare value
      let fare = 0;
      // item value calculation
      let valueOfItem = 0;
      // calculate valueOfItem for person
      if (myself) {
        valueOfItem = 2;
      }
      // if Booking is for send Item
      if (item !== null) {
        // set weight
        let weight = bookingWeight;
        if (bookingWeightType === weightType.KiloGram) {
          weight = weight * 1000;
        }
        // calculate value of Item when weight is available
        switch (true) {
          case weight <= 500: {
            valueOfItem = 1;
            break;
          }
          case weight > 500 && weight <= 1000: {
            valueOfItem = 1;
            break;
          }
          case weight > 1000 && weight <= 1500: {
            valueOfItem = 1.2;
            break;
          }
          case weight > 1500: {
            valueOfItem = 1.5;
            break;
          }
        }
      }

      let mode = "";
      // Calculate Fare
      switch (vehicleType) {
        case VehicleType.Cycle: {
          // fare calculation for vehicle Type Cycle
          fare = VehicleBasePrice.ForCycle * valueOfItem;
          mode = DriveMode.Bicycle;
          break;
        }
        case VehicleType.Bike: {
          // fare calculation for vehicle Type Bike
          fare = VehicleBasePrice.ForBike * valueOfItem;
          mode = DriveMode.Motorcycle;
          break;
        }
        case VehicleType.Auto: {
          // fare calculation for vehicle Type Auto
          fare = VehicleBasePrice.ForAuto * valueOfItem;
          mode = DriveMode.Drive;
          break;
        }
        case VehicleType.Car: {
          // fare calculation for vehicle Type Car
          fare = VehicleBasePrice.ForCar * valueOfItem;
          mode = DriveMode.Drive;
          break;
        }
        case VehicleType.Bus: {
          // fare calculation for vehicle Type Bus
          fare = VehicleBasePrice.ForBus * valueOfItem;
          mode = DriveMode.Bus;
          break;
        }
        case VehicleType.Train: {
          // fare calculation for vehicle Type Train
          fare = VehicleBasePrice.ForTrain * valueOfItem;
          mode = DriveMode.Drive;
          break;
        }
        case VehicleType.Flight: {
          // fare calculation for vehicle Type Flight
          fare = VehicleBasePrice.ForFlight * valueOfItem;
          mode = DriveMode.Drive;
          break;
        }
        case VehicleType.Ship: {
          // fare calculation for vehicle Type Ship
          fare = VehicleBasePrice.ForShip * valueOfItem;
          mode = DriveMode.Walk;
          break;
        }
      }
      // Calculate Distance between two Places using their name only
      async function getLocation(address) {
        let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          address
        )}&format=json`;
        let response = await Axios.get(url);
        let result = response.data[0];

        if (!result) {
          throw new Error(`Could not find location for address "${address}"`);
        }
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        };
      }
      let location1 = await getLocation(startingPoint);
      let location2 = await getLocation(endingPoint);
      let distance = 0;
      await Fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${location1.latitude},${location1.longitude}|${location2.latitude},${location2.longitude}&mode=${mode}&apiKey=${process.env.GEOAPIFY_KEY}`
      )
        .then((response) => response.json())
        .then((result) => {
          distance = result.features[0].properties.distance / 1000;
        })
        .catch((error) => {
          throw error;
        });
      // calculate fare on distance
      switch (true) {
        case distance <= 50: {
          fare = fare;
          break;
        }
        case distance > 50 && distance <= 100: {
          fare = fare - 0.2;
          break;
        }
        case distance > 100 && distance <= 500: {
          fare = fare;
          break;
        }
        case distance > 500 && distance <= 1000: {
          fare = fare - 0.8;
          break;
        }
        case distance > 1000: {
          fare = fare - 1;
          break;
        }
      }
      console.log("fare:", fare, "distance:", distance);
      let finalFare = Number((fare * distance).toFixed(2));

      return exits.success(finalFare);
    } catch (error) {
      //return error
      sails.log.error(
        "Error from File/upload-helper catch : ",
        error.toString()
      );
      return exits.error(error);
    }
  },
};
