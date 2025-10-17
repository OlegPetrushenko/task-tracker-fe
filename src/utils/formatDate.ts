export const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
   
    try {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return dateString || "";
    }
};
