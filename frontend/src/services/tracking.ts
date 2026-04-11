export async function trackPageView(page: string) {
  try {
    await fetch("http://localhost:3000/track/page-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page }),
    });
  } catch (error) {
    console.error("Erro ao registrar acesso:", error);
  }
}

export async function trackSystemClick(systemName: string) {
  try {
    await fetch("http://localhost:3000/track/system-click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ systemName }),
    });
  } catch (error) {
    console.error("Erro ao registrar clique:", error);
  }
}
