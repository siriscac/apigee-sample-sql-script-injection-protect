var request = require('request');
var apigee = require('apigee-access');

function getAccountDetails(req, callback) {
    var accountNumber = req.params.accountNumber;

    var basePath = apigee.getVariable(req, 'appBasePath');

    var options = {
        url: basePath + "/accounts/" + accountNumber,
        json: true
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var accountDetails = body.entities[0];

            accountDetails.id = accountDetails.name;
            accountDetails.created_at = accountDetails.created;
            accountDetails.updated_at = accountDetails.modified;

            delete accountDetails.name;
            delete accountDetails.created;
            delete accountDetails.modified;

            delete accountDetails.uuid;
            delete accountDetails.type;
            delete accountDetails.metadata;

            callback(accountDetails);
        } else {
            callback(null);
        }
    });
}

exports.getAccountInfo = function (req, res) {
    getAccountDetails(req, function (details) {
        delete details.balanceAmount;
        delete details.clearingAmount;

        delete details.balance;
        delete details.balance_available;
        delete details.cash_flow_per_year;
        delete details.preauth_amount;
        res.json(details);
    });
};

exports.getAccountsOfCustomer = function (req, res) {
    if (!req.query || !req.query.customerId) {
        return res.status(400).send();
    }

    var customerId = req.query.customerId;
    console.log(customerId);

    var basePath = apigee.getVariable(req, 'appBasePath');

    var options = {
        url: basePath + "/accounts",
        qs: {
            ql: "where customers = '" + customerId + "'"
        },
        json: true
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var accounts = [];

            for (var i = 0; i < body.entities.length; i++) {
                var accountDetails = {};

                accountDetails.id = body.entities[i].name;
                accountDetails.account_number = body.entities[i].account_number;
                accountDetails.label = body.entities[i].label;
                accountDetails.currency = body.entities[i].currency;
                accountDetails.balance = body.entities[i].balance;
                accountDetails.balance_available = body.entities[i].balance_available;

                accounts.push(accountDetails);
            }

            res.json(accounts);

        } else {
            res.status(400).send();
        }
    });
};

exports.getAccountBalance = function (req, res) {
    getAccountDetails(req, function (details) {
        var balance = {};
        balance.account_number = details.account_number;
        balance.label = details.label;
        balance.balance = details.balance;
        balance.balance_available = details.balance_available;
        balance.cash_flow_per_year = details.cash_flow_per_year;
        balance.currency = details.currency;
        balance.preauth_amount = details.preauth_amount;

        res.json(balance);
    });
};

exports.getAccountTransaction = function (req, res) {
    var accountNumber = req.params.accountNumber;
    var transactionId = req.params.transactionId;

    var basePath = apigee.getVariable(req, 'appBasePath');

    var options = {
        url: basePath + "/accounts/" + accountNumber + "/transactions",
        qs: {
            ql: "order by created desc",
            limit: 1000
        },
        json: true
    };

    if (transactionId) {
        options.url += '/' + transactionId;
        delete options.qs;
    }

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200 && body.entities) {
            var transactions = [];
            for (var i = 0; i < body.entities.length; i++) {
                var transaction = body.entities[i];

                transaction.id = transaction.uuid;
                transaction.created_at = transaction.created;
                transaction.updated_at = transaction.modified;

                delete transaction.created;
                delete transaction.modified;

                delete transaction.uuid;
                delete transaction.type;
                delete transaction.metadata;

                transactions.push(transaction);
            }
            res.json(transactions);
        }
    });
};