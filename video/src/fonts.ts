import { continueRender, delayRender, staticFile } from "remotion";

/**
 * Luckiest Guy and Fredoka, the site's two families, loaded before the first
 * frame is captured. Without the hold, early frames render in the fallback face
 * and the headline visibly jumps when the real one arrives.
 */
const handle = delayRender("Loading Luckiest Guy and Fredoka");

const faces = [
  new FontFace("Luckiest Guy", `url(${staticFile("fonts/luckiest-guy.woff2")}) format("woff2")`),
  new FontFace("Fredoka", `url(${staticFile("fonts/fredoka.woff2")}) format("woff2")`, {
    weight: "300 700",
  }),
];

Promise.all(faces.map((face) => face.load()))
  .then((loaded) => {
    loaded.forEach((face) => document.fonts.add(face));
    continueRender(handle);
  })
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
