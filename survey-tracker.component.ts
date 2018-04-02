/* 
#==============================================================================================================================#
#   AUTHOR: Mu Sigma                                                                                                            #
#   CREATED ON: 2018-01-05                                                                                                     #
#   DESCRIPTION:Populates the Selection table on Trait selection screen , triggers the comparision table                       #
#   ARGUMENTS: the  messge pass funcrion recieves the message as argument                                                      #
#                                                                                                                              #
#                                                                                                                              #
#   REVISION DETAILS:                                                                                                          #
#   Version No.         Date            Author          Change Description                                                     #
#   *************       ************    ************    *********************************                                      #
#   23.0                 2018-01-05      vn5005t            New                                                                 #
################################################################################################################################
*/
import { Component, OnInit, ViewChild, Inject, ViewChildren, QueryList } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material'
import { DataPassingService } from "../services/utils/data-passing.service";
import { FetchDataService } from "../services/data/fetch-data.service";
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-survey-tracker',
  templateUrl: './survey-tracker.component.html',
  styleUrls: ['./survey-tracker.component.scss']
})
export class SurveyTrackerComponent implements OnInit {
  displayedColumns_SurveyTable: any[];
  dataSource_SurveyTable: any;
  url: string;
  response: any;
  allItems: any[];
  data: any;
  StoreValues: any;
  store_filter: any
  department_filter: any;
  status_filter: any;
  isDisabled: true;
  distinctDepartments: string[];
  distinctStatus: string[];
  distinctStores: string[];
  filteredTable: any;
    pageIndex :any;
  pageSize:any;
  @ViewChildren(MatPaginator) paginator: QueryList<MatPaginator>;
  constructor(public snackBar: MatSnackBar, private dataService: DataPassingService, private router: Router, private fetchDataService: FetchDataService, @Inject(Window) private _window: Window) {
    this.url = "http://" + this._window.location.host + "/assets/survey_tracker_data.json";
    //this.url = environment.getSurveyTrackerUrl;
    this.store_filter = "";
    this.department_filter = "";
    this.status_filter = "";
    this.filteredTable = new MatTableDataSource<any>();
  }
  //fetches the survey tracker table on page load and populates the store,department and status filters
  getData() {
    this.fetchDataService.getService(this.url).subscribe(
      //  
      data => {
        this.response = data;
      },
      // error callback handles the error in the http request
      (err) => console.error(err.message),
      // The 3rd callback handles the "complete" event.
      () => {
        console.log("request complete");
        this.displayedColumns_SurveyTable = Object.keys(this.response[0]);
        this.displayedColumns_SurveyTable.splice(this.displayedColumns_SurveyTable.indexOf("User_ID"), 1);
        this.dataSource_SurveyTable = new MatTableDataSource<any>(this.response);
        this.filteredTable.data = this.dataSource_SurveyTable.data.slice();
        //var paginator;
        this.distinctDepartments = this.DistinctDescriptionValue("Department");
        this.distinctStores = this.DistinctDescriptionValue("Store_Nbr");
        this.distinctStatus = this.DistinctDescriptionValue("Status");
        //     setTimeout(() => {
        //   console.log("Async Task Calling Callback");

        //     //[this.paginator]=[paginator];
        //     //this.dataSource_SurveyTable.paginator=this.paginator;
        //     console.log(this.paginator);

        // }, 2000);

      }

    );
  }
  //Filters the data according the store, department and status combination entered by the user
  applyFilter(filterValue: string) {

    this.department_filter = String(this.department_filter).trim();
    this.store_filter = String(this.store_filter).trim();
    this.status_filter = String(this.status_filter).trim();

    if (this.store_filter == '' && this.department_filter == '' && this.status_filter == '') {
      this.filteredTable.data = this.response;
    }

    if (this.department_filter.length != 0) {
      this.filteredTable.filter = this.department_filter;
      this.filteredTable.data = this.filteredTable.filteredData;
    }

    if (this.store_filter != '') {
      this.filteredTable.filter = String(this.store_filter);
      this.filteredTable.data = this.filteredTable.filteredData;
    }

    if (this.status_filter.length != 0) {
      this.filteredTable.filter = this.status_filter;
      this.filteredTable.data = this.filteredTable.filteredData;
    }
    if (this.filteredTable.data.length > 0) {
      this.dataSource_SurveyTable.data = this.filteredTable.data;
    }
    else {
      this.openSnackBar("No such combination Found", "close X")
    }
  }
  DistinctDescriptionValue(descriptionValue: string) {
    var flags = []; var output = []; var surveyDataLength = this.dataSource_SurveyTable.data.length;

    for (let el of this.dataSource_SurveyTable.data) {
      if (flags[el[descriptionValue]]) continue;
      flags[el[descriptionValue]] = true;
      output[output.length++] = (el[descriptionValue]);
    }
    return output;
  }
  //identifies the index of each row and fetches all the information of the row 
  rowValue(rIndex) {
    var finalColumns = ["Store_Nbr", "Store_City", "Store_State", "Store_Sequence_Nbr", "Store_Type", "Project_Type", "Department", "Future_Trait_Effective_Date", "Create_Deadline", "User_ID"]
    var finalData = {};
    //console.log("rIndex",rIndex , this.dataSource_SurveyTable.paginator._pageIndex ,   this.dataSource_SurveyTable.paginator._pageSize );
    
    var selectedRowData = this.dataSource_SurveyTable.data[rIndex + this.pageIndex*this.pageSize ]; //r index is the index of the row in the current dom view  so adding the pageIndex *pageSize we get the index int the current dataSource;
    for (var i = 0; i < finalColumns.length; i++) {
      finalData[finalColumns[i]] = selectedRowData[finalColumns[i]];
    }
    this.StoreValues = JSON.parse(JSON.stringify(finalData));
    var dataToPass = { "storeValues": this.StoreValues }
    this.dataService.dataPass(dataToPass, '/surveyTracker');
    this.router.navigate(["/traitSelection"]);
  }
  //displays an alert if user filters for invalid store, department and status combination
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000,
    });
  }

ngOnInit() {
    this.getData();
  }
ngAfterViewInit(){

    this.paginator.changes.subscribe((paginator: QueryList<MatPaginator>) => {
      console.log(paginator.first);
      this.dataSource_SurveyTable.paginator = paginator.first;
      this.pageIndex = this.dataSource_SurveyTable.paginator._pageIndex ;
      this.pageSize=this.dataSource_SurveyTable.paginator._pageSize ;
    });


  }

}


