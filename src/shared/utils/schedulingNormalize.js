export function normalizeScheduling(s) {
  return {
    id: s.id,
    fechaInicio: s.fechaInicio || s.fecha_inicio || s.fecha,
    fechaFin: s.fechaFin || s.fecha_fin || s.fecha,
    horaInicio: s.horaInicio || s.hora_entrada,
    horaFin: s.horaFin || s.hora_salida,
    id_usuario: s.id_usuario,
    dias: s.dias || s.dias_semana || [],
    bloques: s.bloques || [],
  };
}

export function expandByDaysAndBlocks({ fechaInicio, fechaFin, dias = [], bloques = [], horaInicio, horaFin }) {
  const start = new Date(`${(fechaInicio)}T00:00`);
  const end = new Date(`${(fechaFin || fechaInicio)}T23:59`);
  const diasSemanaMap = { domingo:0,lunes:1,martes:2,miercoles:3,miércoles:3,jueves:4,viernes:5,sabado:6,sábado:6 };
  const selected = dias.map(d => d.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')).map(d => diasSemanaMap[d]).filter(d => d !== undefined);
  const fechas = [];
  let current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (selected.length === 0 || selected.includes(day)) {
      fechas.push(current.toISOString().split('T')[0]);
    }
    current.setDate(current.getDate()+1);
    current.setHours(0,0,0,0);
  }
  const blocks = (bloques && bloques.length > 0) ? bloques : [{ horaInicio, horaFin }];
  return { fechas, blocks };
}