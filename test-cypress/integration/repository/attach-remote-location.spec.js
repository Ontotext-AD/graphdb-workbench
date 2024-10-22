import {RepositorySteps} from "../../steps/repository-steps";
import {AttachRepositorySteps} from "../../steps/repositories/attach-repository-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";

describe('Attach remote location', () => {
    beforeEach(() => {
        cy.visit('/repository');
        RepositorySteps.waitLoader();
        RepositorySteps.waitUntilRepositoriesPageIsLoaded();
    });

    it('Should create and delete remote instance', () => {
        // When I open the "Attach a remote instance" dialog.
        AttachRepositorySteps.openAttachRemoteLocationDialog();

        // Then I expect the "Attach" button to be disabled (not clickable), because location URL is mandatory
        AttachRepositorySteps.getAttachBtn().should('be.disabled');
        // and authentication type to be "None". This is default location type.
        AttachRepositorySteps.getRemoteLocationDialog().should('contain', 'No authentication will be used with this location.');
        // I expect GraphDB type be selected
        AttachRepositorySteps.getGraphDBRadioBtn().should('be.checked');

        // When I fill wrong location URL
        AttachRepositorySteps.enterURL("Wrong URL");

        // Then I expect to see error message
        AttachRepositorySteps.getRemoteLocationDialog().should('contain', 'Note that the location should be a URL that points to a remote GraphDB installation,');

        // When I clear the wrong URL
        AttachRepositorySteps.clearURL();

        // Then I expect to see an error message that states the location is required.
        AttachRepositorySteps.getRemoteLocationDialog().should('contain', 'Location URL is required.');

        // When I fill correct URL
        AttachRepositorySteps.enterURL("http://loc");

        // Then I expect the "Attach" button to be enabled
        AttachRepositorySteps.getAttachBtn().should('be.enabled');

        // When I switch to basic authentication
        AttachRepositorySteps.selectBasicRadioBtn();

        // Then I expect the "Attach" button to be disabled (not clickable), because Username and Password are mandatory
        AttachRepositorySteps.getAttachBtn().should('be.disabled');

        // When I fill Username
        AttachRepositorySteps.enterUsername('username');

        // Then I expect the "Attach" button to be disabled (not clickable), because Password is mandatory
        AttachRepositorySteps.getAttachBtn().should('be.disabled');

        // When I fill password
        AttachRepositorySteps.enterPassword('password');
        // Then I expect the "Attach" button to be enabled
        AttachRepositorySteps.getAttachBtn().should('be.enabled');

        // When I remove the Username and Password and
        AttachRepositorySteps.clearUsername();
        AttachRepositorySteps.clearPassword();
        // switch to Signature authentication type
        AttachRepositorySteps.selectSignatureRadioBtn();

        // Then I expect the "Attach" button to be enabled, because only location URL is mandatory
        AttachRepositorySteps.getAttachBtn().should('be.enabled');

        // When I clear the location URL
        AttachRepositorySteps.clearURL();

        // Then I expect the "Attach" button to be disabled (not clickable), because Location URL is mandatory
        AttachRepositorySteps.getAttachBtn().should('be.disabled');

        // When I switch to Ontopic instance
        AttachRepositorySteps.selectOntopicRadioBtn();
        // Then I expect the "Attach" button to be disabled (not clickable), because Location URL, ClienatId and Secret are mandatory
        AttachRepositorySteps.getAttachBtn().should('be.disabled');

        // When I fill wrong location URL
        AttachRepositorySteps.enterURL("Wrong URL");

        // Then I expect to see error message
        AttachRepositorySteps.getRemoteLocationDialog().should('contain', 'Note that the location should be a URL that points to a remote Ontopic installation,');

        // When I clear the wrong URL
        AttachRepositorySteps.clearURL();

        // Then I expect to see an error message that states the location is required.
        AttachRepositorySteps.getRemoteLocationDialog().should('contain', 'Location URL is required.');

        // When I fill all mandatory fields
        AttachRepositorySteps.enterURL('http://local');
        AttachRepositorySteps.enterUsername("username");
        AttachRepositorySteps.enterPassword('password');

        // Then I expect the "Attach" button to be enabled
        AttachRepositorySteps.getAttachBtn().should('be.enabled');

        // When I click the "Attach" button
        AttachRepositorySteps.attachRemoteLocation();

        // Then I expect location with URL "http://local" to be created
        RepositorySteps.getSparqlOntopicTable().should('contain', 'http://local');

        // When delete the created location
        RepositorySteps.deleteOntopicInstance('http://local');

        // I expect to see deleting confirmation dialog.
        ModalDialogSteps.getDialogBody().should('contain', 'Are you sure you want to detach the location \'http://local\'?');

        // When I confirm
        ModalDialogSteps.clickOnConfirmButton();

        // Then I expect the location to be deleted.
        RepositorySteps.getSparqlOntopicTable().should('not.exist');
    });

    it('Should information be present for all location possible scenarios: error, location with and without repositories', () => {
        // When I open the Repositories view that contains all possible kind of locations.
        RepositoriesStubs.stubRepositories();
        RepositoriesStubs.stubLocations();
        RepositorySteps.getLocalGraphDBTable().should('exist');
        // Then I expect to see the repositories from location GraphDb instance
        RepositorySteps.getLocalGraphDBTable().contains('test · RUNNING');
        // and a remote GraphDB instance with no repositories in it
        RepositorySteps.getRemoteGraphDBTable().contains('There are no repositories in the current location');
        // and a remote GrapDB instance with repositories
        RepositorySteps.getRemoteGraphDBTable().contains('repository-1716184200859 · RUNNI');
        // and a remote GraphDB instance with error in it
        RepositorySteps.getRemoteGraphDBTable().contains('Cannot connect to location Connect to localhost:7212 [localhost/127.0.0.1] fa');
        // and a remote Ontopic instance
        RepositorySteps.getSparqlOntopicTable().contains('http://local');
    });

    it('Should open edit remote location dialog', () => {
        const locationId = 'http://local';
        addRemoteSPARQLLocation(locationId, 'username', 'password');
        RepositorySteps.getLocalGraphDBTable().should('exist');
        // When I click to edit the SPARQL instance
        RepositorySteps.editSparqlInstance(0);
        // Then I expect to see that SPARQL instance is selected
        AttachRepositorySteps.getSparqlEndpointRadioBtn().should('be.checked');
        // And be disabled
        AttachRepositorySteps.getSparqlEndpointRadioBtn().should('be.disabled');
        // The location url be set
        AttachRepositorySteps.getLocationURLInput().should('have.value', locationId);
        // And be disabled for edit
        AttachRepositorySteps.getLocationURLInput().should('be.disabled');
        ModalDialogSteps.close();
        // Then I can remove the new location
        RepositorySteps.deleteSparqlLocation(locationId);
        // When I confirm
        ModalDialogSteps.clickOnConfirmButton();
    });

    it('should create and delete SPARQL endpoint instance', () => {
        const locationId = 'http://endpoint/repo/ex';
        addRemoteSPARQLLocation(locationId, 'username', 'password');
        // Then the dialog has closed
        ModalDialogSteps.getDialog().should('not.exist');
        // And the SPARQL table should be visible
        RepositorySteps.getSparqlOntopicTable().should('contain', locationId);
        // Then I can remove the new location
        RepositorySteps.deleteSparqlLocation(locationId);
        // When I confirm
        ModalDialogSteps.clickOnConfirmButton();
        // Then the instance should be gone
        RepositorySteps.getSparqlOntopicTable().should('not.exist');
    });

    function addRemoteSPARQLLocation(url, username, password) {
        // When I open the "Attach a remote instance" dialog.
        AttachRepositorySteps.openAttachRemoteLocationDialog();
        // Then I expect the "Attach" button to be disabled (not clickable), because location URL is mandatory
        AttachRepositorySteps.getAttachBtn().should('be.disabled');
        // And authentication type to be "None". This is default location type.
        AttachRepositorySteps.getRemoteLocationDialog().should('contain', 'No authentication will be used with this location.');
        // I expect GraphDB type be selected
        AttachRepositorySteps.getGraphDBRadioBtn().should('be.checked');
        // When I select SPARQL Endpoint instance
        AttachRepositorySteps.selectSparqlEndpointRadioBtn();
        // When I fill correct URL, username and password
        AttachRepositorySteps.enterURL(url);
        AttachRepositorySteps.enterUsername(username);
        AttachRepositorySteps.enterPassword(password);
        // Then I expect the "Attach" button to be enabled
        AttachRepositorySteps.getAttachBtn().should('be.enabled');
        // And when I attach the location, it should be visible in the list
        AttachRepositorySteps.attachRemoteLocation();
    }
});
