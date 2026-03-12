// Comic Craft AI - Storyteller JavaScript

const API_URL = 'http://localhost:8000';
let selectedGenre = 'fantasy';
let selectedPanels = 5;
let currentStory = null;

// Example prompts for each genre
const genreExamples = {
    fantasy: [
        "A young girl who discovers a magical library where books come to life",
        "A boy who finds a dragon egg in his grandmother's garden",
        "A kingdom where the stars are disappearing one by one"
    ],
    mythology: [
        "Radha and Krishna's divine love story in the forests of Vrindavan",
        "Young Ganesha writing the Mahabharata with his broken tusk",
        "The magical friendship between Krishna and Sudama"
    ],
    sci_fi: [
        "A friendly alien who crash-lands in a school playground",
        "Robots who learn to feel emotions on a distant space station",
        "Time-traveling kids who visit ancient India"
    ],
    adventure: [
        "Three friends searching for a hidden treasure in an old mansion",
        "A magical map that leads to the Land of Forgotten Dreams",
        "Climbing the Rainbow Mountain to find a wish-granting flower"
    ],
    mystery: [
        "The case of the missing school pet hamster",
        "A mysterious lighthouse keeper who knows everyone's secrets",
        "Detectives solving why the town's clock stopped ticking"
    ],
    friendship: [
        "Two shy children who become best friends at a summer camp",
        "A new girl in school who finds friendship through her love of painting",
        "A boy and his elderly neighbor who become unexpected friends"
    ],
    fairy_tale: [
        "A princess who is afraid of her own shadow",
        "The shoemaker's clever elves return to help again",
        "A cottage where lost things find their way home"
    ]
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadExamples();
});

// Setup event listeners
function setupEventListeners() {
    // Genre tags
    document.querySelectorAll('.genre-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('.genre-tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            selectedGenre = this.dataset.genre;
            loadExamples(); // Load examples for the selected genre
        });
    });
    
    // Panel selector
    document.querySelectorAll('.panel-option').forEach(opt => {
        opt.addEventListener('click', function() {
            document.querySelectorAll('.panel-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            selectedPanels = parseInt(this.dataset.panels);
        });
    });
}

// Load example prompts for the selected genre
function loadExamples() {
    const examplesRow = document.getElementById('examplesRow');
    const examples = genreExamples[selectedGenre] || genreExamples.fantasy;
    
    examplesRow.innerHTML = examples.map(ex => 
        `<button class="example-chip" onclick="useExample('${ex}')">${ex}</button>`
    ).join('');
}

// Use an example prompt
function useExample(prompt) {
    document.getElementById('storyPrompt').value = prompt;
    // Scroll to the generate button
    document.getElementById('generateBtn').scrollIntoView({ behavior: 'smooth' });
}

// Generate story
async function generateStory() {
    const prompt = document.getElementById('storyPrompt').value.trim();
    
    if (!prompt) {
        alert('Please enter a story idea!');
        return;
    }
    
    // Show loading
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('loadingSection').classList.add('active');
    document.getElementById('loadingText').textContent = 'Creating your magical story with AI...';
    
    try {
        const response = await fetch(`${API_URL}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                genre: selectedGenre,
                user_prompt: prompt,
                num_panels: selectedPanels
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate story');
        }
        
        const story = await response.json();
        currentStory = story;
        displayStory(story);
    } catch (error) {
        console.error(error);
        alert('Error generating story. Please try again. Make sure the backend is running!');
        document.getElementById('inputSection').style.display = 'block';
        document.getElementById('loadingSection').classList.remove('active');
    }
}

// Display story in the UI with more descriptive narrative
function displayStory(story) {
    document.getElementById('loadingSection').classList.remove('active');
    document.getElementById('storyOutput').classList.add('active');
    
    // Title
    document.getElementById('storyTitle').textContent = story.title || 'My Amazing Story';
    
    // Moral
    document.getElementById('storyMoral').textContent = story.moral ? `💡 "${story.moral}"` : '';
    
    // Full Narrative - Make it more descriptive with dialogues
    const narrativeBox = document.getElementById('narrativeBox');
    let narrativeHTML = '';
    
    if (story.summary) {
        narrativeHTML += `<div class="story-summary"><h4>📖 Summary</h4><p>${story.summary}</p></div>`;
    }
    
    if (story.panels) {
        narrativeHTML += '<div class="story-chapters"><h4>📚 Complete Story</h4>';
        story.panels.forEach((panel, index) => {
            narrativeHTML += `
                <div class="chapter">
                    <h5>Chapter ${index + 1}: ${panel.tagline || panel.type}</h5>
                    <p class="chapter-narration">${panel.narration || ''}</p>
                    <p class="chapter-dialogue">${panel.dialogue || ''}</p>
                </div>
            `;
        });
        narrativeHTML += '</div>';
    }
    narrativeBox.innerHTML = narrativeHTML;
    
    // Real Life Lesson
    const lessonSection = document.getElementById('lessonSection');
    if (story.realLifeLesson) {
        document.getElementById('lessonText').textContent = story.realLifeLesson;
        lessonSection.style.display = 'block';
    } else {
        lessonSection.style.display = 'none';
    }
    
    // Characters
    const charactersGrid = document.getElementById('charactersGrid');
    const charactersSection = document.getElementById('charactersSection');
    
    if (story.characters && story.characters.length > 0) {
        charactersGrid.innerHTML = story.characters.map(char => `
            <div class="character-card">
                <div class="character-avatar">👤</div>
                <h4>${char.name}</h4>
                <span class="character-role">${char.role}</span>
                <p>${char.desc}</p>
            </div>
        `).join('');
        charactersSection.style.display = 'block';
    } else {
        charactersSection.style.display = 'none';
    }
    
    // Panels
    const panelsGrid = document.getElementById('panelsGrid');
    panelsGrid.innerHTML = '';
    
    if (story.panels) {
        story.panels.forEach(panel => {
            const card = document.createElement('div');
            card.className = 'panel-card';
            card.innerHTML = `
                <div class="panel-card-header">
                    <span class="panel-num">PANEL ${panel.panel_number}</span>
                    <span class="panel-type">${panel.tagline || panel.type}</span>
                </div>
                <div class="panel-image-container">
                    ${panel.image_url ? 
                        `<img src="${panel.image_url}" alt="Panel ${panel.panel_number}">` :
                        `<div class="panel-placeholder">
                            <i class="fas fa-palette"></i>
                            <span>Generating...</span>
                        </div>`
                    }
                </div>
                <div class="panel-text">
                    <p class="panel-narration"><strong>${panel.narration || ''}</strong></p>
                    <p class="panel-dialogue">${panel.dialogue || ''}</p>
                </div>
            `;
            panelsGrid.appendChild(card);
        });
    }
    
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// Download story as PDF
function downloadStory() {
    if (!currentStory) {
        alert('No story to download!');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(currentStory.title || 'My Story', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // Moral
    if (currentStory.moral) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "italic");
        doc.text(`"${currentStory.moral}"`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
    }
    
    // Summary
    if (currentStory.summary) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const summaryLines = doc.splitTextToSize(currentStory.summary, maxWidth);
        doc.text(summaryLines, margin, yPos);
        yPos += summaryLines.length * 7 + 10;
    }
    
    // Real Life Lesson
    if (currentStory.realLifeLesson) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('Real Life Lesson:', margin, yPos);
        yPos += 8;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const lessonLines = doc.splitTextToSize(currentStory.realLifeLesson, maxWidth);
        doc.text(lessonLines, margin, yPos);
        yPos += lessonLines.length * 7 + 15;
    }
    
    // Characters
    if (currentStory.characters && currentStory.characters.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('Characters:', margin, yPos);
        yPos += 8;
        
        currentStory.characters.forEach(char => {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(`${char.name} (${char.role})`, margin, yPos);
            yPos += 6;
            
            doc.setFont("helvetica", "normal");
            const descLines = doc.splitTextToSize(char.desc, maxWidth);
            doc.text(descLines, margin, yPos);
            yPos += descLines.length * 6 + 5;
        });
        yPos += 10;
    }
    
    // Story Panels
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('Story:', margin, yPos);
    yPos += 10;
    
    if (currentStory.panels) {
        currentStory.panels.forEach((panel, index) => {
            // Check if we need a new page
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(`Panel ${panel.panel_number}: ${panel.tagline || panel.type}`, margin, yPos);
            yPos += 7;
            
            // Narration
            doc.setFont("helvetica", "italic");
            const narrationLines = doc.splitTextToSize(panel.narration || '', maxWidth);
            doc.text(narrationLines, margin, yPos);
            yPos += narrationLines.length * 6;
            
            // Dialogue
            if (panel.dialogue) {
                doc.setFont("helvetica", "normal");
                const dialogueLines = doc.splitTextToSize(panel.dialogue, maxWidth);
                doc.text(dialogueLines, margin, yPos);
                yPos += dialogueLines.length * 6;
            }
            
            yPos += 10;
        });
    }
    
    // Save the PDF
    doc.save(`${currentStory.title || 'my-story'}.pdf`);
}

// Reset to new story
function newStory() {
    document.getElementById('storyOutput').classList.remove('active');
    document.getElementById('inputSection').style.display = 'block';
    document.getElementById('storyPrompt').value = '';
    currentStory = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
