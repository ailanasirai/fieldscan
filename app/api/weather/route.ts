import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const city = "Burewala,PK";

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Weather data unavailable" }, { status: 502 });
    }

    const data = await res.json();

    return NextResponse.json({
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      city: data.name,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}