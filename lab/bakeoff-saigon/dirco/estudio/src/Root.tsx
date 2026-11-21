import React from "react";
import { Composition } from "remotion";
import { Collage, DURACION, FPS } from "./Collage";
export const RemotionRoot: React.FC = () => (
  <Composition id="Collage" component={Collage} durationInFrames={DURACION} fps={FPS} width={1920} height={1080} />
);
