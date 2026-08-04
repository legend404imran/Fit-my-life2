/* =========================================================
   NOTES / JOURNAL
   ========================================================= */

const Notes = (() => {
  let searchQuery = '';

  async function render() {
    const all = (await DB.getAll('notes'));
    let filtered = all.filter(n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.body.toLowerCase().includes(searchQuery.toLowerCase())
    );
    filtered.sort((a, b) => (b.pinned - a.pinned) || b.updatedAt.localeCompare(a.updatedAt));

    if (!filtered.length) {
      document.getElementById('notesList').innerHTML = `<div class="empty-state">No notes ${searchQuery ? 'match your search' : 'yet. Start your journal!'}</div>`;
      return;
    }

    document.getElementById('notesList').innerHTML = filtered.map(n => `
      <div class="note-card ${n.pinned ? 'pinned' : ''}" data-noteid="${n.id}">
        ${n.pinned ? '<div class="note-pin-badge"><svg viewBox="0 0 24 24"><path d="M12 2l2 7h7l-5.5 4.5L17 21l-5-4-5 4 1.5-7.5L3 9h7z"/></svg></div>' : ''}
        <div class="note-title">${Util.sanitize(n.title)}</div>
        <div class="note-body">${Util.sanitize(n.body.slice(0, 140))}${n.body.length > 140 ? '…' : ''}</div>
        <div class="note-meta">${Util.formatDateShort(n.createdAt.slice(0,10))}</div>
      </div>
    `).join('');

    document.querySelectorAll('[data-noteid]').forEach(card => {
      card.onclick = () => openNoteModal(filtered.find(n => n.id === card.dataset.noteid));
    });
  }

  function openNoteModal(note = null) {
    Util.openModal(`
      <h3 class="modal-title">${note ? 'Edit Note' : 'New Note'}</h3>
      <input class="input" id="nTitle" placeholder="Title" value="${Util.escapeAttr(note?.title || '')}">
      <textarea class="input" id="nBody" rows="6" placeholder="Write your thoughts..." style="margin-top:10px;resize:vertical;">${note ? Util.sanitize(note.body) : ''}</textarea>
      <label style="display:flex;align-items:center;gap:8px;margin-top:14px;font-size:13px;color:var(--text-1);">
        <input type="checkbox" id="nPinned" style="width:16px;height:16px;" ${note?.pinned?'checked':''}> Pin this note
      </label>
      <div class="modal-actions">
        ${note ? `<button class="btn-danger" id="nDelete">Delete</button>` : `<button class="btn-ghost" id="nCancel">Cancel</button>`}
        <button class="btn-primary" id="nSave">Save</button>
      </div>
    `);
    if (note) {
      document.getElementById('nDelete').onclick = () => Util.confirmAction('Delete this note?', async () => {
        await DB.remove('notes', note.id);
        Util.closeModal(); render();
      });
    } else {
      document.getElementById('nCancel').onclick = Util.closeModal;
    }
    document.getElementById('nSave').onclick = async () => {
      const title = document.getElementById('nTitle').value.trim();
      const body = document.getElementById('nBody').value.trim();
      if (!title && !body) { Util.toast('Note is empty', 'error'); return; }
      const pinned = document.getElementById('nPinned').checked;
      const now = new Date().toISOString();
      await DB.put('notes', {
        id: note?.id, title: title || 'Untitled', body, pinned,
        createdAt: note?.createdAt || now, updatedAt: now
      });
      Util.closeModal(); render();
      Util.toast('Note saved', 'success');
    };
  }

  function bindEvents() {
    document.getElementById('btnAddNote').onclick = () => openNoteModal();
    document.getElementById('notesSearch').oninput = Util.debounce((e) => {
      searchQuery = e.target.value; render();
    }, 200);
  }

  return { render, bindEvents, openNoteModal };
})();
