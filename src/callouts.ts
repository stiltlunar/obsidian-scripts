class callouts {

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

    for (let section in schema) {
      const codeInd = "```"
      dv.paragraph(`${codeInd}dataviewjs\nconst { ${section} } = customJS\ntry {\n${section}.render(dv)\n} catch(error) {\ndv.paragraph("> [!error] Error: '${section}' is not a custom script")\n}\n${codeInd}`)
    }

  }

  async getSchema(note, dv) {
    try {
      const schema = dv.page(note.type + "@callouts");
      return schema.file.frontmatter;
    } catch (error) {
      return false;
    }
  }

  // handle missing schema

}