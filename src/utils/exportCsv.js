export function exportToCsv(filename, rows) {
  if (!rows || !rows.length) {
    alert('No participant records to export.');
    return;
  }
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(header => {
          let cell = row[header] ?? '';
          if (typeof cell === 'string') {
            cell = `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(',')
    )
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}