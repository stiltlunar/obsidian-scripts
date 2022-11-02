class tifa {
    // TODO: Incorporate this functionality to read json for writing callout for types
    async getJSON(page, dv) {
        try {
            let content = await dv.io.load(page.file.path);
            content = content.trim();
            content = content.slice(3, -3);
            const json = JSON.parse(content);
            return json;
        }
        catch (error) {
            return false;
        }
    }
    // !!! ALL METHODS WITH 'render' PREFIX ARE CALLED FROM OBSIDIAN !!!
    // !!! RENAMING A 'render' METHOD WILL AFFECT ALL PAGES CALLING THE METHOD !!!
    // * GLOBAL
    createCallout(type, message, content) {
        try {
            // TODO: accomodate ordered and unordered lists
            if (!type) {
                throw new Error('createCallout() called without type');
            }
            let calloutString = `> [!${type}]`;
            if (message) {
                calloutString += ` ${message}`;
            }
            if (content) {
                if (typeof content === 'string') {
                    calloutString += `\n${content}`;
                }
                else {
                    const joinedContent = content.join('\n');
                    calloutString += `\n${joinedContent}`;
                }
            }
            return calloutString;
        }
        catch (error) {
            return `> [!bug] Problem with createCallout()\n ${error}`;
        }
    }
    getWordCount(content) {
        const count = content.split(' ').length;
        return count;
    }
    async addImplicitProps(note, dv) {
        const newNote = note;
        newNote.content = await dv.io.load(newNote.file.path);
        newNote.wordCount = this.getWordCount(newNote.content);
        return newNote;
    }
    // * CALLOUTS
    async renderCallouts(dv) {
        try {
            const note = await this.addImplicitProps(dv.current(), dv);
            const readTime = await this.getReadTime(note, dv);
            if (readTime) {
                dv.span(readTime);
            }
            await this.getNoteCallouts(note, dv);
        }
        catch (error) {
            dv.span(`> [!bug] Problem with renderCallouts()\n${error}`);
        }
    }
    async getNoteCallouts(note, dv) {
        try {
            if (!note.type) {
                dv.span(this.createCallout('missing', 'Missing Note Type'));
                return;
            }
            const schema = await this.getJSON(dv.page(note.type + '@callouts'), dv);
            if (!schema) {
                dv.span(this.createCallout('missing', `Missing [[Callout Schema]] | [[${note.type}@callouts |Add One]]`));
                return;
            }
            let content = [];
            let done = false;
            for (let key in schema) {
                if (key === 'file') {
                    // for things like file property on a note
                    schema[key].forEach(rule => {
                        const passed = this.compareRule(note[key], rule);
                        if (!passed) {
                            rule.result.type ? dv.paragraph(this.createCallout(rule.result.type, rule.result.message, rule.result.content)) : content.push(rule.result.content);
                            if (rule.result.done) {
                                done = true;
                                return;
                            }
                        }
                    });
                }
                else {
                    schema[key].forEach(rule => {
                        const passed = this.compareRule(note, rule);
                        if (!passed) {
                            rule.result.type ? dv.paragraph(this.createCallout(rule.result.type, rule.result.message, rule.result.content)) : content.push(rule.result.content);
                            if (rule.result.done) {
                                done = true;
                                return;
                            }
                        }
                    });
                }
                if (done) {
                    return;
                }
            }
            if (done) {
                return;
            }
            if (content.length !== 0) {
                dv.paragraph(this.createCallout('warning', 'Needs Work', content));
            }
        }
        catch (error) {
            dv.span(`> [!bug] Problem with getNoteCallouts()\n${error}`);
        }
    }
    compareRule(note, rule) {
        try {
            const property = rule.property;
            const condition = rule.condition;
            if (!note[property]) {
                throw new Error(`${property} property does not exist`);
            }
            if (condition[1] === ' ') {
                let operator = condition[0];
                let value = condition.slice(-(condition.length - 2));
                if (operator === '<') {
                    return note[property] > value;
                }
                else if (operator === '>') {
                    return note[property] < value;
                }
                else if (operator === '<=') {
                    return note[property] >= value;
                }
                else if (operator === '>=') {
                    return note[property] <= value;
                }
                else if (operator === '!') {
                    return note[property] == value;
                }
                else if (operator === '=') {
                    return note[property] !== value;
                }
            }
            if (typeof condition === 'string') {
                return note[property] === condition;
            }
        }
        catch (error) {
            return `> [!bug] Problem with compareRule()\n${error}`;
        }
    }
    // * TASKS
    // TODO: handle queries and display of tasks
    // * BIBLIOGRAPHY
    // TODO: handle creating bibliography for topic based on references to book notes
    renderBibliography(dv) {
        try {
            const references = this.formatReferences(this.getBookReferences(dv.current(), dv), dv);
            const bibliography = `## Bibliography\n${references.join('\n')}`;
            dv.paragraph(bibliography);
        }
        catch (error) {
            dv.paragraph(`> [!bug] Problem with renderBibliography()\n${error}`);
        }
    }
    getBookReferences(noteData, dv) {
        const outlinks = noteData.file.outlinks;
        let bookReferences = [];
        outlinks.forEach(link => {
            if (dv.page(link).type === '📖') {
                bookReferences.push(link);
            }
        });
        return bookReferences;
    }
    formatReferences(references, dv) {
        const formattedReferences = [];
        references.forEach(reference => {
            const info = dv.page(reference);
            if (info.format === 'Book') {
                formattedReferences.push(`${info.author}. *${info.title}*. ${info.publishLocation}: ${info.publisher}, ${info.publishDate}. [[${info.file.name} | ⬈]]`);
            }
            if (info.format === 'Journal Article') {
                formattedReferences.push(`${info.author}. "*${info.title}*." ${info.publisher} ${info.issue} (${info.publishDate}): ${info.pages} [[${info.file.name} | ⬈]]`);
            }
        });
        return formattedReferences;
    }
    // * ESTIMATED READ TIME
    async getReadTime(note, dv) {
        try {
            const content = await dv.io.load(note.file.path);
            const wordCount = this.getWordCount(content);
            const readTime = Math.round(wordCount / 200);
            let hourText = '';
            let minText = '';
            let hours = '';
            let mins = '';
            // set mins and hours
            if (readTime > 60) {
                hours = Math.floor(readTime / 60);
                mins = readTime % 60;
            }
            else {
                mins = readTime;
            }
            // set hour text
            if (hours) {
                hours === 1 ? hourText = 'hr' : hourText = 'hrs';
            }
            // set min text
            mins === 1 ? minText = 'min' : minText = 'mins';
            return `>[!info] READ TIME: ${hours} ${hourText} ${mins} ${minText}`;
        }
        catch (error) {
            dv.span(`> [!bug] Problem with getReadTime()\n${error}`);
        }
    }
}
