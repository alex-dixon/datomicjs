
/**
 * Hydro configuration
 *
 * @param {Hydro} hydro
 */

module.exports = function(hydro) {
  if (typeof window == 'undefined') require('coffee-script/register')
  hydro.set({
    'fail-fast': true,
    timeout: 1000,
    plugins: [
      require('hydro-fail-fast'),
      require('hydro-focus'),
      require('hydro-bdd'),
      require('hydro-co')
    ],
    globals: {
      should: require('should')
    }
  })
}
