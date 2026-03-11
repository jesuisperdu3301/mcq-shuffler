const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");
const statusEl = document.getElementById("status");

function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function renumberQuestions(questions) {
    return questions.map((q, index) => ({
        ...q,
        newNumber: index + 1
    }));
}

function parseQuestions(text) {
    const raw = text.replace(/\r/g, "").trim();
    const lines = raw.split("\n");

    const questions = [];
    const topLines = [];

    let i = 0;

    while (i < lines.length && !/^\s*\d+\./.test(lines[i])) {
        topLines.push(lines[i]);
        i++;
    }

    while (i < lines.length) {
        if (!/^\s*\d+\./.test(lines[i])) {
            i++;
            continue;
        }

        const questionLines = [lines[i].trim()];
        i++;

        while (
            i < lines.length &&
            !/^\s*[a-zA-Z]\)/.test(lines[i]) &&
            !/^\s*\d+\./.test(lines[i])
        ) {
            if (lines[i].trim() !== "") {
                questionLines.push(lines[i].trim());
            }
            i++;
        }

        const options = [];

        while (i < lines.length && /^\s*[a-zA-Z]\)/.test(lines[i])) {
            const firstMatch = lines[i].match(/^\s*([a-zA-Z])\)\s*(.*)$/);
            const optionTextParts = [firstMatch[2].trim()];
            i++;

            while (
                i < lines.length &&
                !/^\s*[a-zA-Z]\)/.test(lines[i]) &&
                !/^\s*\d+\./.test(lines[i])
            ) {
                if (lines[i].trim() !== "") {
                    optionTextParts.push(lines[i].trim());
                }
                i++;
            }

            options.push({
                text: optionTextParts.join(" ").replace(/\s+/g, " ").trim()
            });
        }

        if (options.length >= 2) {
            const firstQuestionLine = questionLines[0];
            const qm = firstQuestionLine.match(/^\s*(\d+)\.\s*(.*)$/);

            const originalNumber = qm ? qm[1] : "";
            const firstQuestionText = qm ? qm[2] : firstQuestionLine;
            const restQuestionText = questionLines.slice(1);

            const questionText = [firstQuestionText, ...restQuestionText]
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();

            questions.push({
                originalNumber,
                question: questionText,
                options
            });
        }
    }

    if (!questions.length) {
        throw new Error(
            "No questions detected. Use numbered questions like 1. and options like a), b), c)."
        );
    }

    return {
        topText: topLines.join("\n").trim(),
        questions
    };
}

function renderQuestions(parsedQuestions, topText) {
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");

    const renderedQuestions = parsedQuestions
        .map((q) => {
            const shuffledOptions = shuffleArray(q.options);

            const renderedOptions = shuffledOptions
                .map((opt, idx) => `${letters[idx]}) ${opt.text}`)
                .join("\n");

            return `${q.newNumber}. ${q.question}\n${renderedOptions}`;
        })
        .join("\n\n");

    return topText ? `${topText}\n\n${renderedQuestions}` : renderedQuestions;
}

function shuffleFullTest(text) {
    const parsed = parseQuestions(text);
    const shuffledQuestions = shuffleArray(parsed.questions);
    const renumberedQuestions = renumberQuestions(shuffledQuestions);
    const result = renderQuestions(renumberedQuestions, parsed.topText);

    return {
        count: renumberedQuestions.length,
        result
    };
}

document.getElementById("shuffleBtn").addEventListener("click", () => {
    try {
        const { count, result } = shuffleFullTest(inputEl.value);
        outputEl.value = result;
        statusEl.textContent = `Done. Shuffled ${count} question(s) and their options.`;
    } catch (error) {
        statusEl.textContent = `Error: ${error.message}`;
    }
});

document.getElementById("copyBtn").addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(outputEl.value);
        statusEl.textContent = "Output copied to clipboard.";
    } catch {
        statusEl.textContent = "Could not copy automatically. Please copy manually.";
    }
});

document.getElementById("downloadBtn").addEventListener("click", () => {
    const blob = new Blob([outputEl.value], {
        type: "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shuffled-test.txt";
    a.click();
    URL.revokeObjectURL(url);
    statusEl.textContent = "Downloaded shuffled-test.txt";
});

document.getElementById("sampleBtn").addEventListener("click", () => {
    inputEl.value = `1. Το κύριο όργανο του κυκλοφορικού συστήματος είναι:
a) η καρδιά.
b) τα αγγεία.
c) το αίμα.

2. Το μυοκάρδιο είναι μυϊκός ιστός που συστέλλεται:
a) συνέχεια.
b) χωρίς τη θέλησή μας.
c) με τη θέλησή μας.

3. Πόσους χώρους έχει η καρδιά;
a) 1
b) 4
c) 2

4. Στο πάνω μέρος της καρδιάς βρίσκονται:
a) Η αριστερή και η δεξιά κοιλία.
b) Ο αριστερός και ο δεξιός κόλπος.
c) Ο αριστερός κόλπος και η αριστερή κοιλία.`;
    statusEl.textContent = "Sample loaded.";
});

document.getElementById("clearBtn").addEventListener("click", () => {
    inputEl.value = "";
    outputEl.value = "";
    statusEl.textContent = "Cleared.";
});