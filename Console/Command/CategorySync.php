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


namespace HawkSearch\Proxy\Console\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Magento\Framework\App\State;
use Magento\Framework\App\Area;
use Magento\Framework\Filesystem\DirectoryList;


class CategorySync extends Command
{
    private $helper;
    /**
     * @var State
     */
    private $state;
    /**
     * @var DirectoryList
     */
    private $dir;

    public function __construct(
        \HawkSearch\Proxy\Helper\DataFactory $helper,
        State $state,
        DirectoryList $dir,
        $name = null
    )
    {
        $this->helper = $helper;
        parent::__construct($name);
        $this->state = $state;
        $this->dir = $dir;
    }

    protected function configure()
    {
        $this->setName('hawksearch:proxy:sync-categories')
            ->setDescription('Run the HawkSearch Category Sync Task');
        parent::configure();
    }

    /**
     * @param InputInterface $input
     * @param OutputInterface $output
     * @return int|null|void
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        chdir($this->dir->getRoot());

        $this->state->setAreaCode(Area::AREA_CRONTAB);
        /** @var \HawkSearch\Proxy\Helper\Data $helper */
        $helper = $this->helper->create();
        $helper->synchronizeHawkLandingPages();

        $output->writeln("executing");
    }

}