import axios from "axios";

export async function getCacheData(force?: boolean) {
  if (!(global as any).cache_data) {
    await axios(`${process.env.BASE_URL}/api/sync-data`, {
      params: {
        force,
      },
    });
  } else {
    axios(`${process.env.BASE_URL}/api/sync-data`, {
      params: {
        force,
      },
    }).catch((err) => {
      console.error(err);
    });
  }

  return (global as any).cache_data;
}
