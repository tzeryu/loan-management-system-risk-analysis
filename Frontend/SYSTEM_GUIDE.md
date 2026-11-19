# Loan Management System - User Guide

## Overview
A comprehensive web-based Loan Management System prototype for internal bank use, featuring role-based access control for Loan Officers and Administrators.

## Demo Credentials

### Loan Officer
- Username: `officer` or `loan-officer`
- Password: (any password)

### Administrator
- Username: `admin` or `administrator`
- Password: (any password)

## Features by Role

### Loan Officer

#### Dashboard
- View summary statistics (Total Applications, Pending Review, Approved, Rejected)
- Browse all loan applications in a table view
- Quick access to view application details

#### Create Loan Application
- Comprehensive form with three sections:
  - **Applicant Information**: Name, Age, Employment Status, Monthly Income, Dependents
  - **Financial Details**: Existing Liabilities, Credit History
  - **Loan Request Details**: Loan Amount, Tenure, Purpose

#### View Risk Analysis Results
- Overall risk score (0-100) with visual indicator
- Risk level badge (Low/Moderate/High Risk)
- Recommended maximum loan amount
- Influential factors breakdown:
  - Credit History
  - Debt-to-Income Ratio
  - Income Level
  - Employment Stability
- Applicant and loan summary
- Forward application for admin review

#### Track Applications
- Visual timeline for each application showing:
  - Submitted → Under Review → Risk Evaluated → Final Decision
- Status indicators with icons
- Additional application details

### Administrator

#### Dashboard
- Summary cards:
  - Applications Awaiting Decision
  - Approval Rate (with progress bar)
  - Rejection Rate (with progress bar)
- Table of applications awaiting review with risk scores
- Complete overview of all applications

#### Review & Approve/Reject Application
- Full applicant information display
- Complete loan request details
- Risk analysis summary with:
  - Overall risk score
  - Risk level classification
  - Recommended maximum amount
  - Key risk factors
- Quick statistics sidebar:
  - Debt-to-Income Ratio
  - Loan-to-Income Ratio
  - Total Financial Burden
- Decision section:
  - Text area for decision reasoning
  - Approve or Reject buttons

#### Audit Log
- Comprehensive activity tracking
- Advanced filtering:
  - Search by application ID, user name, or action
  - Filter by action type
  - Filter by user role
- Summary statistics cards:
  - Total activities
  - Loan Officer actions
  - Admin actions
  - Applications created
- Activity details:
  - Timestamp
  - User role and name
  - Action performed
  - Application ID

## Design Features

- **Clean Professional UI**: Light theme with neutral colors
- **Blue Accents**: Professional banking aesthetic
- **Responsive Layout**: Optimized for desktop use
- **Clear Navigation**: Role-based top navigation bar
- **Visual Feedback**: Toast notifications for user actions
- **Status Badges**: Color-coded status indicators
- **Progress Bars**: Visual representation of metrics
- **Interactive Timeline**: Application status tracking
- **Mock Data**: Pre-populated sample applications and audit logs

## Navigation Flow

### Loan Officer
1. Login → Loan Officer Dashboard
2. Dashboard → Create Application / View Details / Track Status
3. View Application → Risk Analysis → Forward for Review

### Administrator
1. Login → Administrator Dashboard
2. Dashboard → Review Application / Audit Log
3. Review Application → Approve/Reject Decision

## Technical Stack

- **Framework**: React with TypeScript
- **Routing**: React Router DOM
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS v4
- **Notifications**: Sonner (Toast)
- **State Management**: React Context API

## Mock Data

The system includes:
- 8 sample loan applications with various statuses
- 10 audit log entries
- Pre-calculated risk scores and recommendations
- Diverse applicant profiles and loan purposes

All data is client-side only for prototype demonstration purposes.
