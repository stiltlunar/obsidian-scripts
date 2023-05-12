class qualityCheck {
  async render(dv: any) {
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
      let errorMessages: any = [];
      errors.forEach((error: any) => {
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

  async getSchema(note: any, dv: any) {
    try {
      const schema = dv.page(note.type + "@callouts");
      return schema.file.frontmatter;
    } catch (error) {
      return false;
    }
  }

  async getErrors(note: any, schema: any, dv: any) {
    const errors: any = [];
    const qualitySchema = schema.qualityCheck;
    let done = false;

    if (!qualitySchema) {
      dv.span(
        `> [!info] Missing [[Note Quality Checking|Quality Checkers]] | [[${note.type}@callouts|Add Some]]`
      );
      return false;
    }

    /* 
    dataview has different file attributes in different locations
    meta location is dependent on file or frontmatter properties
    */
    for (let metaLocation in qualitySchema) {
      for (let metaKey in qualitySchema[metaLocation]) {
        let noteLocation = note.file
        if (metaLocation === 'frontmatter') {
          noteLocation = note.file.frontmatter
        }
        const rules = qualitySchema[metaLocation][metaKey];
        await rules.forEach(async (rule: any) => {
          const passed = await this.checkRule(rule, noteLocation, metaKey);
          if (!passed && !done) {
            errors.push(rule.error);
            rule.done ? (done = true) : (done = false);
          }
        });
      }
    }

    return errors;
  }

  async checkRule(rule: any, note: any, property: any) {
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
      case "regex":
        let expression = new RegExp(rule.value)
        if (expression.test(note[property]) === false) {check = false};
        break;
    }
    
    return check;
  }
}
