import { client } from "../Database.js";

async function createParkingLot(req, res) {
  try {
    const { id, capacity } = req.body;
    //check for valid parking lot id if its is
    if (!checkHexaDecimalString(id)) {
      throw new Error("Not valid id of parking lot");
    }
    const db = client.db("Parking-Lots");
    const ParkingLots = db.collection("ParkingLots");
    const document = { id, capacity, current: 3, leftSlots: [] };

    if (
      !isNaN(capacity) &&
      Number(capacity) > Number(0) &&
      Number(capacity) <= Number(2000)
    ) {
      const p = await ParkingLots.insertOne(document);
    } else {
      throw "Capacity is not within the limit";
    }
    res.status(200).json({
      success: true,
      response: {
        id: id,
        capacity: capacity,
        isActive: true,
      },
      message: "Operation successful.",
    });
  } catch (error) {
    if (error == "Error: Capacity is not within the limit") {
      res.status(400).json({
        Message:
          "Kindly provide the capacity of parking lot in the range of 0 to 2000 and capacity should be greater than 0",
      });
    } else if (error == "Error: Not valid id of parking lot") {
      res.status(400).json({ message: "Not valid id of parking lot" });
    } else {
      res
        .status(500)
        .json({ Message: "error in creating a active parking lot" });
    }
  }
}

function checkHexaDecimalString(s) {
  if (s.length !== 24) {
    return false;
  }
  for (let i = 0; i < s.length; i++) {
    let ch = s[i];
    if (
      (ch < "0" || ch > "9") &&
      (ch < "A" || ch > "F") &&
      (ch < "a" || ch > "f")
    ) {
      return false;
    }
  }
  return true;
}

export { createParkingLot, checkHexaDecimalString };
