export interface DressCode {
  enabled: boolean;
  title: string;
  description: string;
  colors: { name: string; hex: string }[];
}

export const defaultDressCode: DressCode = {
  enabled: true,
  title: "Dress Code",
  description: "Dengan kerendahan hati, kami berharap teman-teman dapat mengenakan busana dengan nuansa warna berikut untuk menciptakan suasana yang indah dan harmonis di hari spesial kami.",
  colors: [
    { name: "Sand", hex: "#DDD0C0" }, { name: "Beige", hex: "#C5B6A3" },
    { name: "Taupe", hex: "#A49888" }, { name: "Sage", hex: "#929063" },
    { name: "Olive", hex: "#777542" }, { name: "Moss", hex: "#655A36" },
    { name: "Cream", hex: "#F3DFCC" }, { name: "Linen", hex: "#E6DACB" },
    { name: "Blush", hex: "#DFC4B4" }, { name: "Nude", hex: "#E5CEBE" },
    { name: "Peach", hex: "#EBD0BA" }, { name: "Khaki", hex: "#CBB598" },
    { name: "Terracotta", hex: "#BB8D74" }, { name: "Caramel", hex: "#B58159" },
    { name: "Camel", hex: "#875B34" }, { name: "Rust", hex: "#6F402B" },
    { name: "Chocolate", hex: "#4C291D" }, { name: "Espresso", hex: "#301B18" },
  ],
};
