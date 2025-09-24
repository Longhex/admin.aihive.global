import axios from "axios";

export async function getCacheData() {
  if (!(global as any).cache_data) {
    await axios(`${process.env.BASE_URL}/api/sync-data`);
  } else {
    axios(`${process.env.BASE_URL}/api/sync-data`).catch((err) => {
      console.error(err);
    });
  }

  return (global as any).cache_data;
}
