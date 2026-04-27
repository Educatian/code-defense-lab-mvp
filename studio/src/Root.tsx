import { Composition } from "remotion";
import { Onboarding, ONBOARDING_DURATION_FRAMES, ONBOARDING_FPS } from "./Onboarding";

export const Root = () => (
  <>
    <Composition
      id="Onboarding"
      component={Onboarding}
      durationInFrames={ONBOARDING_DURATION_FRAMES}
      fps={ONBOARDING_FPS}
      width={1920}
      height={1080}
    />
  </>
);
