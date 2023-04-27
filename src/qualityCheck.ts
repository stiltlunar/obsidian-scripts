class qualityCheck {
  async render(dv) {
    const note = dv.current();
    if (!note.type) {
      dv.span("> [!missing] Missing Note Type");
      return;
    }

    const schema = await this.getSchema(note, dv);
    if (!schema) {
      dv.span(
        `> [!missing] Missing [[Callout Schema]] | [[${note.type}@callouts|Add One]]`
      );
      return;
    }

    const errors = await this.getErrors(note, schema, dv);

    if (!errors) {
      return;
    } else if (errors.length > 0) {
      let errorMessages = [];
      errors.forEach((error) => {
        const message = error.content
          ? `> [!warning] ${error.message}\n>${error.content}\n`
          : `> [!warning] ${error.message}\n`;
        errorMessages.push(message);
      });

      dv.span(`${errorMessages.join("\n")}`);
    } else {
      dv.span("> [!success] This is a quality note");
    }
  }

  async addImplicitMeta() {}

  async getSchema(note, dv) {
    try {
      const schema = dv.page(note.type + "@callouts");
      return schema.file.frontmatter;
    } catch (error) {
      return false;
    }
  }

  async getErrors(note, schema, dv) {
    const errors = [];
    const qualitySchema = schema.qualityCheck;
    let done = false;

    if (!qualitySchema) {
      dv.span(
        `> [!info] Missing [[Note Quality Checking|Quality Checkers]] | [[${note.type}@callouts|Add Some]]`
      );
      return false;
    }

    for (let metaLocation in qualitySchema) {
      if (metaLocation === 'frontmatter') {
        for (let metaKey in qualitySchema[metaLocation]) {
          const rules = qualitySchema[metaLocation][metaKey];
          await rules.forEach(async (rule) => {
            const passed = await this.checkRule(rule, note.file.frontmatter, metaKey);
            if (!passed && !done) {
              errors.push(rule.error);
              rule.done ? (done = true) : (done = false);
            }
          });
        }
      }
      if (metaLocation === 'file') {
        for (let metaKey in qualitySchema[metaLocation]) {
          const rules = qualitySchema[metaLocation][metaKey];
          await rules.forEach(async (rule) => {
            const passed = await this.checkRule(rule, note.file, metaKey);
            if (!passed && !done) {
              errors.push(rule.error);
              rule.done ? (done = true) : (done = false);
            }
          });
        }
      }
    }

    return errors;
  }

  async checkRule(rule, note, property) {
    let check = true;

    let correctedProperty

    if (typeof note[property] === 'number') {
      correctedProperty = note[property]
    } else if (Array.isArray(note[property])) {
      correctedProperty = note[property].length
    }

    switch (rule.condition) {
      case "equals":
        if (rule.value !== note[property]) {check = false};
        break;
      case "required":
        if (!note[property]) {check = false};
        break;
      case "greaterThan":
        if (correctedProperty > note[property]) {check = false};
        break;
      case "lessThan":
        if (correctedProperty < note[property]) {check = false};
        break;
      case "greaterThanEqualTo":
        if (correctedProperty >= note[property]) {check = false};
        break;
      case "lessThanEqualTo":
        if (correctedProperty <= note[property]) {check = false};
        break;
      case "contains":
        if (note[property].includes(rule.value)) {check = false};
        break;
      case "containsNot":
        if (!note[property].includes(rule.value)) {check = false};
        break;  
    }
    
    return check;
  }
}
