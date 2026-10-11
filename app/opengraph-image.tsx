import { ImageResponse } from "next/og";
import { readInvitation } from "@/lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Kartu preview undangan pernikahan";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function Logo() {
  return (
    <svg width="72" height="72" viewBox="0 0 171 171" fill="none">
      <rect width="171" height="171" rx="31" fill="black" />
      <path
        d="M97.2933 69.5243L87.4009 53.8574L77.4968 69.5243L75.4087 72.814L62.5415 93.1821L62.2966 93.567C60.3951 96.5768 57.6303 98.9799 54.3056 100.263C53.1857 100.695 52.0542 100.998 51.0743 100.998C48.3212 100.998 45.7781 100.1 43.725 98.5716C42.1151 97.3817 40.8202 95.8068 39.9453 93.987C38.6271 91.2339 38.3005 87.9326 39.432 84.5029C41.0419 79.58 45.7548 76.3487 50.9343 76.3487H51.0743C52.3342 76.3487 53.559 76.5353 54.7139 76.8853C57.467 71.0991 59.9051 65.733 61.7366 61.6384C61.34 61.475 60.9317 61.3234 60.5234 61.1834C56.9887 59.9702 53.1391 59.4219 49.1261 59.6785C35.0808 60.5885 23.5202 71.7291 22.1436 85.7394C21.2571 94.8036 24.5351 103.121 30.2979 109.001C31.6744 110.412 33.191 111.684 34.8358 112.78C38.4521 115.218 42.6517 116.863 47.1896 117.47C48.4612 117.645 49.7561 117.738 51.0743 117.738C55.5889 117.738 59.8585 116.712 63.6731 114.868C68.5143 112.535 72.4923 108.732 75.3737 104.194L77.3802 101.033L87.4009 85.1795L90.3756 89.8924L100.268 74.2255L97.2933 69.5243Z"
        fill="white"
      />
      <path
        d="M138.076 80.2216L131.31 69.5126L121.406 53.8574L104.409 80.7582L94.5049 96.4368L104.397 112.08L114.301 96.4134L121.406 85.1795L128.172 95.8885L138.204 111.765L148.108 96.0868L138.076 80.2216Z"
        fill="white"
      />
    </svg>
  );
}

export default async function Image() {
  const invitation = await readInvitation();
  const { bride, groom } = invitation.couple;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #29251f 0%, #151412 54%, #0b0b0a 100%)",
          color: "#f5f0e7",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: 1110,
            height: 540,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(201, 169, 110, 0.7)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 12,
              border: "1px solid rgba(201, 169, 110, 0.22)",
            }}
          /          >
            <div
              style={{
                display: "flex",
                marginBottom: 16,
              }}
            >
              <Logo />
            </div>
            <div
              style={{
                color: "#c9a96e",
                fontFamily: "Arial, sans-serif",
                fontSize: 16,
                letterSpacing: 8,
                marginBottom: 22,
            }}
          >
            THE WEDDING OF
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              fontSize: 82,
              fontWeight: 400,
              letterSpacing: 2,
            }}
          >
            <span>{bride.shortName}</span>
            <span style={{ color: "#c9a96e", fontSize: 54 }}>&amp;</span>
            <span>{groom.shortName}</span>
          </div>
          <div
            style={{
              width: 110,
              height: 1,
              background: "#c9a96e",
              marginTop: 32,
              marginBottom: 24,
            }}
          />
          <div
            style={{
              color: "#d2c9b9",
              fontFamily: "Arial, sans-serif",
              fontSize: 20,
              letterSpacing: 5,
            }}
          >
            {invitation.events.displayDate.toUpperCase()}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 38,
              color: "#8f877a",
              fontFamily: "Arial, sans-serif",
              fontSize: 14,
              letterSpacing: 4,
            }}
          >
            DENGAN PENUH KEBAHAGIAAN, KAMI MENGUNDANG ANDA
          </div>
        </div>
      </div>
    ),
    size,
  );
}

