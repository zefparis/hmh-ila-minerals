import { redirect } from "next/navigation";
import { CFG } from "@/data";

export default function Home() {
  redirect("/" + CFG.defaultModule);
}
