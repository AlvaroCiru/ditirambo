import { PALETTE } from "./palette";

/**
 * Marca abstracta de Ditirambo: un homenaje geométrico a los círculos de
 * Kandinsky (periodo de Murnau), reutilizada por favicon, apple-icon y los
 * iconos del manifest PWA para que el diseño viva en un único sitio.
 */
export function getBrandMarkElement(size: number) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PALETTE.paper,
        borderRadius: size * 0.22,
      }}
    >
      <div
        style={{
          position: "relative",
          width: size * 0.74,
          height: size * 0.74,
          display: "flex",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: PALETTE.indigo,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "6%",
            left: "8%",
            width: "52%",
            height: "52%",
            borderRadius: "50%",
            background: PALETTE.ochre,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "4%",
            right: "10%",
            width: "30%",
            height: "30%",
            borderRadius: "50%",
            background: PALETTE.terracotta,
          }}
        />
      </div>
    </div>
  );
}
