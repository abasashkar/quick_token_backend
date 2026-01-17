function generateSlots(start, end, duration, breakStart, breakEnd) {
  const slots = [];
  let [h, m] = start.split(':').map(Number);
  let [eh, em] = end.split(':').map(Number);

  while (h < eh || (h === eh && m < em)) {
    const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    // Skip break time
    if (!(time >= breakStart && time < breakEnd)) {
      slots.push(time);
    }

    m += duration;
    if (m >= 60) {
      h++;
      m -= 60;
    }
  }
  return slots;
}

module.exports = generateSlots;
