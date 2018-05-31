<?php
/**
 * Copyright (c) 2018 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

namespace HawkSearch\Proxy\Cron;
use Magento\Framework\Filesystem\DirectoryList;

class SyncCategories
{
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    protected $helper;
    /** @var \HawkSearch\Proxy\Model\ProxyEmail $email */
    private $email;
    private $dir;

    public function __construct(
        \HawkSearch\Proxy\Helper\Data $helper,
        \HawkSearch\Proxy\Model\ProxyEmail $email,
        DirectoryList $dir
    )
    {
        $this->helper = $helper;
        $this->email = $email;
        $this->dir = $dir;
    }

    public function execute() {
        chdir($this->dir->getRoot());

        $errors = [];
        if($this->helper->isCategorySyncCronEnabled()) {
            if (($timestamp = $this->helper->isSyncLocked())) {
                $subject = "HawkSearch process is locked. Categories NOT synchronized.";
                $errors[] = sprintf("HawkSearch Cron process locked since %s", $timestamp);
            } else {
                $errors = $this->helper->synchronizeHawkLandingPages();
                $subject = sprintf("HawkSearch Category Sync Completed %s errors", empty($errors) ? "without" : "WITH");
            }
            $errors = implode("\n", $errors);
            $this->email->sendEmail(['errors' => $errors, 'subject' => $subject]);
        }
    }
}