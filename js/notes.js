// 15. NOTLARIM MODÜLÜ
// ==========================================
const addNoteBtn = document.getElementById('add-note-btn');
const noteFormContainer = document.getElementById('note-form-container');
const cancelNoteBtn = document.getElementById('cancel-note-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const notesGrid = document.getElementById('notes-grid');

if(addNoteBtn) addNoteBtn.onclick = () => { noteFormContainer.style.display = 'block'; noteTitleInput.focus(); };
if(cancelNoteBtn) cancelNoteBtn.onclick = () => { noteFormContainer.style.display = 'none'; noteTitleInput.value = ''; noteContentInput.value = ''; };

if(saveNoteBtn) {
    saveNoteBtn.onclick = () => {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        if(!content) { showNotify("Not içeriği boş olamaz!", "fa-triangle-exclamation"); return; }
        
        const newNote = {
            id: Date.now(),
            title: title || "Başlıksız Not",
            content: content,
            date: new Date().toLocaleString('tr-TR')
        };
        
        notes.unshift(newNote); 
        localStorage.setItem('notes', JSON.stringify(notes));
        initNotes();
        cancelNoteBtn.onclick();
        showNotify("Not kaydedildi!", "fa-check");
        if(accessToken) backupToDrive(true);
    };
}

function initNotes() {
    if(!notesGrid) return;
    notesGrid.innerHTML = '';
    if(notes.length === 0) {
        notesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-muted);"><i class="fa-regular fa-note-sticky fa-3x" style="margin-bottom: 10px;"></i><p>Henüz bir not eklenmedi.</p></div>';
        return;
    }
    notes.forEach(note => {
        const div = document.createElement('div');
        div.className = 'note-card';
        div.innerHTML = `
            <i class="fa-solid fa-trash-can delete-note" onclick="deleteNote(${note.id})"></i>
            <h4>${escapeHTML(note.title)}</h4>
            <p>${escapeHTML(note.content)}</p>
            <span class="note-date">${escapeHTML(note.date)}</span>
        `;
        notesGrid.appendChild(div);
    });
}

window.deleteNote = (id) => {
    if(confirm("Bu notu silmek istiyor musunuz?")) {
        notes = notes.filter(n => n.id !== id);
        localStorage.setItem('notes', JSON.stringify(notes));
        initNotes();
        showNotify("Not silindi", "fa-trash");
        if(accessToken) backupToDrive(true);
    }
};

// ==========================================
