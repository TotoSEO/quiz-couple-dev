-- Reset invoice counter: delete test invoices and restart sequence at 1
DELETE FROM annuaire_invoices;
ALTER SEQUENCE annuaire_invoice_seq RESTART WITH 1;
