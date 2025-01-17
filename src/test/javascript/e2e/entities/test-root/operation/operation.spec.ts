/* tslint:disable no-unused-expression */
import { browser, ExpectedConditions as ec, protractor, promise } from 'protractor';
import { NavBarPage, SignInPage } from '../../../page-objects/jhi-page-objects';

import { OperationComponentsPage, OperationDeleteDialog, OperationUpdatePage } from './operation.page-object';

const expect = chai.expect;

describe('Operation e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let operationUpdatePage: OperationUpdatePage;
  let operationComponentsPage: OperationComponentsPage;
  let operationDeleteDialog: OperationDeleteDialog;

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.autoSignInUsing('admin', 'admin');
    await browser.wait(ec.visibilityOf(navBarPage.entityMenu), 5000);
  });

  it('should load Operations', async () => {
    await navBarPage.goToEntity('operation');
    operationComponentsPage = new OperationComponentsPage();
    await browser.wait(ec.visibilityOf(operationComponentsPage.title), 5000);
    expect(await operationComponentsPage.getTitle()).to.eq('jhipsterApp.testRootOperation.home.title');
  });

  it('should load create Operation page', async () => {
    await operationComponentsPage.clickOnCreateButton();
    operationUpdatePage = new OperationUpdatePage();
    expect(await operationUpdatePage.getPageTitle()).to.eq('jhipsterApp.testRootOperation.home.createOrEditLabel');
    await operationUpdatePage.cancel();
  });

  it('should create and save Operations', async () => {
    const nbButtonsBeforeCreate = await operationComponentsPage.countDeleteButtons();

    await operationComponentsPage.clickOnCreateButton();
    await promise.all([
      operationUpdatePage.setDateInput('01/01/2001' + protractor.Key.TAB + '02:30AM'),
      operationUpdatePage.setDescriptionInput('description'),
      operationUpdatePage.setAmountInput('5'),
      operationUpdatePage.bankAccountSelectLastOption()
      // operationUpdatePage.labelSelectLastOption(),
    ]);
    expect(await operationUpdatePage.getDateInput()).to.contain('2001-01-01T02:30', 'Expected date value to be equals to 2000-12-31');
    expect(await operationUpdatePage.getDescriptionInput()).to.eq('description', 'Expected Description value to be equals to description');
    expect(await operationUpdatePage.getAmountInput()).to.eq('5', 'Expected amount value to be equals to 5');
    await operationUpdatePage.save();
    expect(await operationUpdatePage.getSaveButton().isPresent(), 'Expected save button disappear').to.be.false;

    expect(await operationComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeCreate + 1, 'Expected one more entry in the table');
  });

  it('should delete last Operation', async () => {
    const nbButtonsBeforeDelete = await operationComponentsPage.countDeleteButtons();
    await operationComponentsPage.clickOnLastDeleteButton();

    operationDeleteDialog = new OperationDeleteDialog();
    expect(await operationDeleteDialog.getDialogTitle()).to.eq('jhipsterApp.testRootOperation.delete.question');
    await operationDeleteDialog.clickOnConfirmButton();

    expect(await operationComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeDelete - 1);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
