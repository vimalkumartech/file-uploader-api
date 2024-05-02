import { Inter } from "next/font/google";
import FileUploader from "./FileUploader";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={`${inter.className}`}>
      <FileUploader />
    </main>
  );
}
