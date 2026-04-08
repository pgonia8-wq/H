export const useWithdraw = () => {
    const requestWithdraw = async (
      userId: string,
      amount: number,
      wallet: string
    ) => {
      if (!userId) throw new Error("No user");
      if (!wallet) throw new Error("Wallet requerida");
      if (amount <= 0) throw new Error("Monto inválido");

      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount, wallet }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al procesar retiro");
      }

      return true;
    };

    return { requestWithdraw };
  };
  