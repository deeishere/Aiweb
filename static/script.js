document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault(); // منع إعادة تحميل الصفحة

    const formData = new FormData(this);

    fetch('/register', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const msgDiv = document.getElementById('message');
        if(data.status === 'success'){
            msgDiv.style.color = 'lightgreen';
            msgDiv.textContent = 'تم تسجيلك بنجاح ✅';
            this.reset(); // تفريغ الفورم
        } else {
            msgDiv.style.color = 'red';
            msgDiv.textContent = 'حدث خطأ أثناء التسجيل ❌';
        }
    })
    .catch(() => {
        const msgDiv = document.getElementById('message');
        msgDiv.style.color = 'red';
        msgDiv.textContent = 'حدث خطأ في الاتصال بالخادم ❌';
    });
});

function showSection() {
  document.getElementById('e3lam-box').style.display = 'none';
  document.getElementById('mawared-box').style.display = 'none';
  document.getElementById('tasmeem-box').style.display = 'none';

  var selected = document.getElementById('category').value;
  if (selected === 'e3lam') {
    document.getElementById('e3lam-box').style.display = 'block';
  } else if (selected === 'mawared') {
    document.getElementById('mawared-box').style.display = 'block';
  } else if (selected === 'tasmeem') {
    document.getElementById('tasmeem-box').style.display = 'block';
  }
}

// Tabs logic
function showTab(tab) {
    var formBox = document.querySelector('.form-box');
    var joinUsBtn = document.querySelector('.join-us-btn');

    if (tab === 'register') {
        if (formBox.style.display === 'block') {
            formBox.style.display = 'none';
            joinUsBtn.classList.remove('active');
        } else {
            formBox.style.display = 'block';
            joinUsBtn.classList.add('active');
        }
    }
}

// Close button functionality
var closeButton = document.querySelector('.close-button');
if (closeButton) {
    closeButton.addEventListener('click', function() {
        // Call showTab function to close the form
        showTab('register');
    });
}

(() => {
  const canvas = document.getElementById('nodes-bg');
  const ctx = canvas.getContext('2d');
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); // cap DPR for perf

  const settings = {
    density: 0.00012,   // nodes per pixel^2 (scaled by viewport area)
    speed: 0.25,        // px per frame (base)
    linkDistance: 140,  // max distance to draw a line
    linkToMouse: true,  // draw lines to mouse pointer
    bounce: true,       // bounce off edges
  };

  let nodes = [];
  const mouse = { x: null, y: null, active: false };

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function resize() {
    const { innerWidth: w, innerHeight: h } = window;
    canvas.width  = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Recompute node count by area; clamp for perf.
    const target = Math.max(40, Math.min(280, Math.floor(w * h * settings.density)));
    if (nodes.length < target) {
      const needed = target - nodes.length;
      for (let i = 0; i < needed; i++) nodes.push(makeNode(w, h));
    } else if (nodes.length > target) {
      nodes.length = target;
    }
  }

  function makeNode(w, h) {
    const angle = rand(0, Math.PI * 2);
    const speed = settings.speed * rand(0.5, 1.5);
    return {
      x: rand(0, w),
      y: rand(0, h),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--node-size')) || 2,
    };
  }

  function step() {
    const { width: Wcss, height: Hcss } = canvas.getBoundingClientRect();
    const W = Wcss; const H = Hcss;
    ctx.clearRect(0, 0, W, H);

    // Lines
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx*dx + dy*dy;
        const maxD = settings.linkDistance;
        if (d2 < maxD * maxD) {
          const d = Math.sqrt(d2);
          const alpha = Math.max(0, (1 - d / maxD)) * parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--line-max-opacity'));
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${getComputedStyle(document.documentElement).getPropertyValue('--node')}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Mouse links
    if (settings.linkToMouse && mouse.active) {
      for (const n of nodes) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const d2 = dx*dx + dy*dy;
        const maxD = settings.linkDistance * 1.2;
        if (d2 < maxD * maxD) {
          const d = Math.sqrt(d2);
          const alpha = Math.max(0, (1 - d / maxD)) * parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--line-max-opacity'));
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${getComputedStyle(document.documentElement).getPropertyValue('--node')}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Nodes
    ctx.fillStyle = `rgba(${getComputedStyle(document.documentElement).getPropertyValue('--node')}, 0.9)`;
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();

      // move
      n.x += n.vx;
      n.y += n.vy;

      if (settings.bounce) {
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.x = Math.max(0, Math.min(W, n.x));
        n.y = Math.max(0, Math.min(H, n.y));
      } else {
        // wrap
        if (n.x < -10) n.x = W + 10; else if (n.x > W + 10) n.x = -10;
        if (n.y < -10) n.y = H + 10; else if (n.y > H + 10) n.y = -10;
      }
    }

    requestAnimationFrame(step);
  }

  // Events
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
  }, { passive: true });
  window.addEventListener('mouseleave', () => { mouse.active = false; }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (t) { mouse.x = t.clientX; mouse.y = t.clientY; mouse.active = true; }
  }, { passive: true });
  window.addEventListener('touchend', () => { mouse.active = false; }, { passive: true });

  resize();
  requestAnimationFrame(step);
})(); 