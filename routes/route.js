import { Router } from "express";
import { createParkingLot } from "./controllers/createParkingLot.js";
import parking, {
  parkingLeft,
  RegistrationByColor,
  slotsByColor,
} from "./controllers/parking.js";

const router = Router();

router.post("/api/ParkingLots", createParkingLot);
router.post("/api/Parkings", parking);
router.get("/api/Parkings", RegistrationByColor);
router.get("/api/Slots", slotsByColor);

router.delete("/api/Parkings", parkingLeft);

export default router;
