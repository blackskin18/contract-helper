const addr = {
  WETH : "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  WBTC : "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
  USDC : "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
  DAI : "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  UNI: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
  LINK: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
  DAI_WHALE : "0xbDB910984f263fF8Cb96EE765067a8f95e0eD587",
  GMX : {
      Vault : "0x489ee077994B6658eAfA855C308275EAd8097C4A",
      GlpManager: "0x3963FfC9dff443c2A94f21b129D429891E32ec18",
      fsGlp: "0x1aDDD80E6039594eE970E5872D247bf0414C8903",
      glp: "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258",
      gmx: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
      sGmx: "0x908C4D94D34924765f1eDc22A1DD098397c59dD4",
      keeper: "0xbEe27BD52dB995D3c74Dc11FF32D93a1Aad747f7",
      usdg: "0x45096e7aA921f27590f8F19e457794EB09678141",
      PositionRouter: "0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868",
      Router: "0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064",
      ReferralStorage: "0xe6fab3F0c7199b0d34d7FbE83394fc0e0D06e99d",
      RewardRouter: "0xA906F338CB21815cBc4Bc87ace9e68c87eF8d8F1",
      GlpRewardRouter: "0xB95DB5B167D75e6d04227CfFFA61069348d271F5",
      FastPriceFeed: "0x11D62807dAE812a0F1571243460Bf94325F43BB7",
  }
}

const gmxHelperConfig = [
  addr.GMX.Vault,
  addr.GMX.glp,
  addr.GMX.fsGlp,
  addr.GMX.GlpManager,
  addr.GMX.PositionRouter,
  addr.GMX.usdg
]

const geniBotAddress = "0x45543E7D0BD61caC9e5d2f9c77151ee097421AA2"
const levelHelper = "0x3281f09130BBAAf64F88F7ef5505a147C075E9CA"
const geniToken = "0x9D47c368bb8138a5E6957F58CA08cb6f69495D8A"
const balanceHelper = "0xd729a932e69b7bB6D4EffaAc3E9EC8fA2EEfD4C4"
const GeniVault = "0xf1eB955869388b7e74b7a1a38245F7b09E4d79DE"

//bot factory
module.exports = [
  addr.GMX.PositionRouter, addr.GMX.Vault, addr.GMX.Router, geniBotAddress, levelHelper
];

// gmx helper
// module.exports = [
//   geniToken,
//   balanceHelper
// ];