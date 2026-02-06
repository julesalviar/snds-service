import Handlebars from 'handlebars';

export function registerHelpers() {
  Handlebars.registerHelper('uppercase', (text) => text.toUpperCase());
  Handlebars.registerHelper('lowercase', (text) => text.toLowerCase());

  Handlebars.registerHelper('getField', function (row, path) {
    return path.split('.').reduce(function (acc, part) {
      return acc && acc[part];
    }, row);
  });
}
