import { client } from "../Database.js";
import { checkHexaDecimalString } from "./createParkingLot.js";

const carColor = ["RED", "GREEN", "BLUE", "BLACK", "WHITE", "YELLOW", "ORANGE"];

//parking

export default async function parking(req, res) {
  try {
    const { parkingLotId, registrationNumber, color } = req.body;
    if (!checkHexaDecimalString(parkingLotId)) {
      throw new Error("Invalid parking lot id");
    }

    console.log("colr", typeof color);
    console.log(carColor.includes(color));
    if (!carColor.includes(color)) {
      throw new Error(
        "your car color should be any of these 'RED', 'GREEN', 'BLUE', 'BLACK', 'WHITE', 'YELLOW', 'ORANGE'"
      );
    }
    if (!isValidRegistrationNumber(registrationNumber)) {
      throw new Error("invalid car registration number");
    }

    const db = client.db("Parking-Lots");
    const ParkingLotCapacity = db.collection("ParkingLots");
    const slotNUmber = await ParkingLotCapacity.findOne({ id: parkingLotId });
    console.log(slotNUmber);
    console.log(slotNUmber.leftSlots);

    const { current, leftSlots, capacity } = slotNUmber;
    var currentSlot;

    if (current >= 2000 && leftSlots.length == 0) {
      throw new Error("parking lot is full");
    } else {
      if (leftSlots.length > 0) {
        currentSlot = leftSlots[0];
        leftSlots.splice(0, 1);

        const slots = await ParkingLotCapacity.findOneAndUpdate(
          { id: parkingLotId },
          { $set: { leftSlots: leftSlots } }
        );
        console.log(slots);
      } else if (current < 2000 && current < capacity) {
        currentSlot = Number(current) + Number(1);
        const curreDoc = await ParkingLotCapacity.findOneAndUpdate(
          { id: parkingLotId },
          { $inc: { current: 1 } }
        );
      } else {
        throw new Error("Parking Lot is full");
      }
    }

    console.log("current slot", currentSlot);
    const Parking = db.collection("Parking");

    const document = {
      parkingLotId,
      registrationNumber,
      color,
      SlotNumber: currentSlot,
    };
    const p = await Parking.insertOne(document);

    res.status(200).json({
      success: true,
      response: {
        SlotNumber: currentSlot,
        status: "PARKED",
      },
      message: "Operation successful.",
    });
  } catch (error) {
    console.log("error", error);
    if (
      error ==
      "Error: your car color should be any of these 'RED', 'GREEN', 'BLUE', 'BLACK', 'WHITE', 'YELLOW', 'ORANGE'"
    ) {
      res.status(400).json({ message: "invalid car color" });
    } else if (error == "Error: parking lot is full") {
      res.status(400).json({ message: "parking lot is full" });
    } else if (error == "Error: invalid car registration number") {
      res.status(400).json({ message: "invalid car registration number" });
    } else if (error == "Error: Invalid parking lot id") {
      res.status(400).json({ message: "Invalid parking lot id" });
    } else if (error == "Error: Parking Lot is full") {
      res.status(400).json({ message: "Parking Lot is full" });
    } else {
      res.status(500).json({ message: "error in alotting parking" });
    }
  }
}

//parking left
async function parkingLeft(req, res) {
  try {
    const { parkingLotId, registrationNumber } = req.body;

    const db = client.db("Parking-Lots");
    const ParkingLotCapacity = db.collection("ParkingLots");
    const slotNUmber = await ParkingLotCapacity.findOne({ id: parkingLotId });
    console.log(slotNUmber);

    const { leftSlots } = slotNUmber;

    const parking = db.collection("Parking");
    const num = await parking.findOne({
      registrationNumber: registrationNumber,
    });

    console.log(num);

    if (num == null) {
      throw new Error("No such car exists with the registration number");
    }

    leftSlots.push(num.SlotNumber);
    console.log("left", leftSlots);
    leftSlots.sort();

    const slots = await ParkingLotCapacity.findOneAndUpdate(
      { id: parkingLotId },
      { $set: { leftSlots: leftSlots } }
    );

    const p = await parking.deleteMany({
      registrationNumber: registrationNumber,
    });

    res.json({
      success: true,
      response: {
        slotNumber: num.SlotNumber,
        registrationNumber: registrationNumber,
        status: "LEFT",
      },
      message: "Operation successful.",
    });
  } catch (error) {
    console.log(error);
    if (error == "Error: No such car exists with the registration number") {
      res
        .status(400)
        .json({ message: "No such car exists with the registration number" });
    } else {
      res.json({ message: "Server error" });
    }
  }
}

//to check the registration number

function isValidRegistrationNumber(number) {
  var regex = /^[A-Z]{2}(0[1-9]|1[0-9]|20)[A-Z]\d{4}$/;

  return regex.test(number);
}

async function RegistrationByColor(req, res) {
  console.log("hii");
  console.log(req.query);
  const { color, parkingLotId } = req.query;

  console.log(color, parkingLotId);
  try {
    const color = req.query.color;
    const parkingLotId = req.query.parkingLotId;
    const db = client.db("Parking-Lots");
    const Parking = db.collection("Parking");
    const Details = Parking.find({
      parkingLotId: parkingLotId,
      color: color,
    });

    const registrations = [];
    for await (const doc of Details) {
      registrations.push({
        color: doc.color,
        registrationNumber: doc.registrationNumber,
      });
    }
    if (registrations.length > 0) {
      res.status(200).json({
        success: true,
        response: {
          registrations,
        },
      });
    } else {
      res.status(200).json({
        isSuccess: false,
        error: {
          reason: `No car found with color ${color}`,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
}

async function slotsByColor(req, res) {
  console.log(req.query);
  const { color, parkingLotId } = req.query;

  console.log(color, parkingLotId);
  try {
    const color = req.query.color;
    const parkingLotId = req.query.parkingLotId;
    const db = client.db("Parking-Lots");
    const Parking = db.collection("Parking");
    const Details = Parking.find({
      parkingLotId: parkingLotId,
      color: color,
    });

    const slots = [];
    for await (const doc of Details) {
      slots.push({
        color: doc.color,
        slotNumber: doc.SlotNumber,
      });
    }
    if (slots.length > 0) {
      res.status(200).json({
        success: true,
        response: {
          slots,
        },
      });
    } else {
      res.status(200).json({
        isSuccess: false,
        error: {
          reason: `No car found with color ${color}`,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export { parkingLeft, RegistrationByColor, slotsByColor };
