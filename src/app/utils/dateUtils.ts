export const getDay = (gameDate: Date) => gameDate.getDate();

export const getMonth = (gameDate: Date) => gameDate
    .toLocaleDateString('sv-SE', {month: 'short'})
    .replace('.', '');

export const getTime = (gameDate: Date) => gameDate
    .toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit'
});
