import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import defaultData from "@/data/invitation-data.json";

const dataFilePath = path.join(process.cwd(), "data", "invitation-data.json");

export async function GET() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, "utf8");
      return NextResponse.json(JSON.parse(content));
    }
    return NextResponse.json(defaultData);
  } catch (error) {
    console.error("Error reading invitation data:", error);
    return NextResponse.json(defaultData);
  }
}

export async function POST(request: Request) {
  try {
    const updatedData = await request.json();

    // Ensure directory exists
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2), "utf8");
    return NextResponse.json({ success: true, message: "Data berhasil disimpan!" });
  } catch (error) {
    console.error("Error saving invitation data:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data undangan" },
      { status: 500 }
    );
  }
}
