// const { BlackList, Account } = require("../models");
// const Connection = require("../bin/connection");
// const { errorResponse } = require("../util/responseHandle");

// const sequelize = Connection.getInstance();

// class KeystoreService {
//   async upsertKeyStore({ account_id, current_refresh_token }) {
//     const transaction = await sequelize.transaction();
//     try {
//       const keystore = await Account.findOne({
//         where: { id: account_id },
//         transaction,
//       });

//       if (!keystore) {
//         await transaction.rollback();
//         return null;
//       }

//       keystore.current_refresh_token = current_refresh_token;
//       await keystore.save({ transaction });

//       const blackList = await BlackList.findAll();

//       if (blackList.length > 0) {
//         await BlackList.destroy({
//           where: {},
//           transaction,
//         });
//       }

//       await transaction.commit();
//     } catch (error) {
//       await transaction.rollback();
//       console.log("Error during upserting keystore: ", error);
//     }
//   }

//   async addBlackList({ account_id, new_refresh_token, old_refresh_token }) {
//     const transaction = await sequelize.transaction();
//     try {
//       await BlackList.create(
//         {
//           account_id,
//           refresh_token: old_refresh_token,
//         },
//         { transaction }
//       );

//       const account = await Account.findOne({ where: { id: account_id } });

//       if (!account)
//         throw new errorResponse({
//           message: "Account not found",
//           statusCode: 404,
//         });

//       account.current_refresh_token = new_refresh_token;

//       await account.save({ transaction });
//       return await transaction.commit();
//     } catch (error) {
//       await transaction.rollback();
//       console.log("Error during adding to blacklist: ", error);
//     }
//   }

//   async removeBlackList({ account_id }) {
//     const transaction = await sequelize.transaction();
//     try {
//       await BlackList.destroy({
//         where: { account_id },
//         transaction,
//       });

//       const account = await Account.findOne({ where: { id: account_id } });

//       if (!account)
//         throw new errorResponse({
//           message: "Account not found",
//           statusCode: 404,
//         });

//       account.current_refresh_token = null;

//       await account.save({ transaction });
//       return await transaction.commit();
//     } catch (error) {
//       await transaction.rollback();
//       console.log("Error during removing from blacklist: ", error);
//     }
//   }
// }

// module.exports = new KeystoreService();
