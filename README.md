# ICT SMO Club Budget Proposal

This website keeps official document layouts fixed while clubs enter information through browser forms.

The first page lets users choose between:

- Club Budget Proposal
- Club Application Form and Qualification Certificate

## Live website

<https://kungnapatkrit.github.io/ict-smo-budget/>

## Run it

Clone the repository, enter its folder, and run:

```bash
git clone https://github.com/KungNapatkrit/ict-smo-budget.git
cd ict-smo-budget
python3 server.py
```

Then open:

<http://127.0.0.1:8000>

Press `Control-C` in Terminal to stop the server.

The logo is already included in `assets/logo.png`. To extract a replacement logo from another `.dotx` template, provide that template when starting the server:

```bash
python3 server.py --template "template.dotx"
```

## Current features

- Form-selection home page
- Fixed A4 proposal preview
- Two-page club application and qualification certificate
- Committee fields for four required roles
- Add and remove activity rows
- Automatic total budget
- Repeating activity-table header when printed across pages
- Save and reopen form data as JSON
- Print or save as PDF using the browser print dialog
- Local-only server bound to `127.0.0.1`

For the most consistent output, choose A4 paper, 100% scale, and enable background graphics in the browser print dialog.
