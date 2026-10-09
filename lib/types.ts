export type Status = "idle" | "connecting" | "live" | "error";

export type Detection = {
  species: string;
  common_names: string[];
  family?: string;
  score: number;
  gbif_id?: string;
};

export type FrameResult = {
  id: string;
  time: string;
  admin: string;
  threshold: number; 
  detections: Detection[];
};