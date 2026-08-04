/* =========================================================
   CHARTS — lightweight canvas-based charting (no dependencies)
   ========================================================= */

const Charts = (() => {

  function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#00D9A3';
  }

  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const h = canvas.getAttribute('height') || rect.height || 120;
    canvas.width = rect.width * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w: rect.width, h: +h };
  }

  function lineChart(canvas, labels, values, opts = {}) {
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);
    const color = opts.color || getCssVar('--accent');
    const padTop = 14, padBottom = 24, padSide = 8;
    const max = opts.max || Math.max(...values, 1) * 1.15;
    const min = 0;
    const plotH = h - padTop - padBottom;
    const plotW = w - padSide * 2;
    const stepX = values.length > 1 ? plotW / (values.length - 1) : 0;

    // grid lines
    ctx.strokeStyle = 'rgba(128,128,128,0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padTop + (plotH / 3) * i;
      ctx.beginPath(); ctx.moveTo(padSide, y); ctx.lineTo(w - padSide, y); ctx.stroke();
    }

    // area fill
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = padSide + stepX * i;
      const y = padTop + plotH - ((v - min) / (max - min)) * plotH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(padSide + stepX * (values.length - 1), padTop + plotH);
    ctx.lineTo(padSide, padTop + plotH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
    grad.addColorStop(0, color + '55');
    grad.addColorStop(1, color + '05');
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = padSide + stepX * i;
      const y = padTop + plotH - ((v - min) / (max - min)) * plotH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // points
    values.forEach((v, i) => {
      const x = padSide + stepX * i;
      const y = padTop + plotH - ((v - min) / (max - min)) * plotH;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = getCssVar('--surface') || '#12171F';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.stroke();
    });

    // labels
    ctx.fillStyle = getCssVar('--text-2') || '#717A87';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((lab, i) => {
      const x = padSide + stepX * i;
      ctx.fillText(lab, x, h - 6);
    });
  }

  function barChart(canvas, labels, values, opts = {}) {
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);
    const color = opts.color || getCssVar('--accent');
    const padTop = 14, padBottom = 24, padSide = 10;
    const max = opts.max || Math.max(...values, 1) * 1.2;
    const plotH = h - padTop - padBottom;
    const plotW = w - padSide * 2;
    const gap = 8;
    const barW = (plotW / values.length) - gap;

    values.forEach((v, i) => {
      const x = padSide + i * (barW + gap);
      const barH = max > 0 ? (v / max) * plotH : 0;
      const y = padTop + plotH - barH;
      const r = Math.min(6, barW / 2);
      ctx.fillStyle = opts.colors ? opts.colors[i] : color;
      roundRect(ctx, x, y, barW, barH, r);
      ctx.fill();
    });

    ctx.fillStyle = getCssVar('--text-2') || '#717A87';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((lab, i) => {
      const x = padSide + i * (barW + gap) + barW / 2;
      ctx.fillText(lab, x, h - 6);
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (h < 0) { y += h; h = Math.abs(h); }
    h = Math.max(h, 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function multiLineChart(canvas, labels, series, opts = {}) {
    // series: [{name, values, color}]
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);
    const padTop = 14, padBottom = 24, padSide = 8;
    const allVals = series.flatMap(s => s.values);
    const max = opts.max || Math.max(...allVals, 1) * 1.15;
    const plotH = h - padTop - padBottom;
    const plotW = w - padSide * 2;

    ctx.strokeStyle = 'rgba(128,128,128,0.15)';
    for (let i = 0; i <= 3; i++) {
      const y = padTop + (plotH / 3) * i;
      ctx.beginPath(); ctx.moveTo(padSide, y); ctx.lineTo(w - padSide, y); ctx.stroke();
    }

    series.forEach(s => {
      const stepX = s.values.length > 1 ? plotW / (s.values.length - 1) : 0;
      ctx.beginPath();
      s.values.forEach((v, i) => {
        const x = padSide + stepX * i;
        const y = padTop + plotH - (v / max) * plotH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });

    ctx.fillStyle = getCssVar('--text-2') || '#717A87';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((lab, i) => {
      const stepX = labels.length > 1 ? plotW / (labels.length - 1) : 0;
      ctx.fillText(lab, padSide + stepX * i, h - 6);
    });
  }

  return { lineChart, barChart, multiLineChart };
})();
